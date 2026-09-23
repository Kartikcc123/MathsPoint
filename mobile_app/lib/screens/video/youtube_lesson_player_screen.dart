import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../core/services/api_service.dart';

class YouTubeLessonPlayerScreen extends StatefulWidget {
  final String? lessonId;
  final Map<String, dynamic>? initialLesson;

  const YouTubeLessonPlayerScreen({
    super.key,
    this.lessonId,
    this.initialLesson,
  });

  @override
  State<YouTubeLessonPlayerScreen> createState() =>
      _YouTubeLessonPlayerScreenState();
}

class _YouTubeLessonPlayerScreenState
    extends State<YouTubeLessonPlayerScreen> {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>>? _playerFuture;
  Map<String, dynamic>? _playerData;

  WebViewController? _webViewController;

  bool _isFullscreen = false;
  bool _isLoading = true;

  Timer? _progressTimer;

  // ============================================================
  // INIT / DISPOSE
  // ============================================================

  @override
  void initState() {
    super.initState();

    if (widget.lessonId != null) {
      _playerFuture =
          _apiService.getLessonPlayer(widget.lessonId!);
    }
  }

  @override
  void dispose() {
    // runJavaScriptReturningResult is not implemented by
    // webview_flutter_web, so do not call it on Flutter Web.
    if (!kIsWeb) {
      _saveProgress();
    }

    _progressTimer?.cancel();
    _restorePortrait();

    super.dispose();
  }

  // ============================================================
  // YOUTUBE VIDEO ID
  // ============================================================

  String _extractYouTubeVideoId(String url) {
    final uri = Uri.tryParse(url);

    if (uri == null) {
      return '';
    }

    final host = uri.host.replaceFirst(
      RegExp(r'^www\.'),
      '',
    );

    if (host == 'youtu.be') {
      if (uri.pathSegments.isNotEmpty) {
        return uri.pathSegments.first;
      }
    }

    if (host == 'youtube.com' ||
        host == 'youtube-nocookie.com') {
      if (uri.pathSegments.isNotEmpty &&
          uri.pathSegments.first == 'embed' &&
          uri.pathSegments.length >= 2) {
        return uri.pathSegments[1];
      }

      if (uri.path == '/watch') {
        return uri.queryParameters['v'] ?? '';
      }
    }

    return '';
  }

  // ============================================================
  // WEBVIEW INITIALIZATION
  // ============================================================

  void _initializeWebView(String embedUrl) {
    final controller = WebViewController();

    if (!kIsWeb) {
      controller
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(Colors.black)
        ..enableZoom(false)
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (_) {
              if (mounted) {
                setState(() {
                  _isLoading = true;
                });
              }
            },
            onPageFinished: (_) {
              if (mounted) {
                setState(() {
                  _isLoading = false;
                });
              }
            },
            onWebResourceError: (error) {
              debugPrint(
                'WebView Error: '
                '${error.errorCode} - '
                '${error.description}',
              );
            },
            onNavigationRequest: (request) {
              final url = request.url;

              if (url.contains('youtube.com') ||
                  url.contains('youtube-nocookie.com') ||
                  url.contains('ytimg.com') ||
                  url.contains('googlevideo.com') ||
                  url.contains('google.com') ||
                  url.contains('gstatic.com') ||
                  url.startsWith('about:') ||
                  url.startsWith('data:') ||
                  url.startsWith('blob:')) {
                return NavigationDecision.navigate;
              }

              if (url.startsWith('https://mathspoint.co.in')) {
                return NavigationDecision.navigate;
              }

              return NavigationDecision.prevent;
            },
          ),
        );
    }

    debugPrint('Loading MathsPoint YouTube player: $embedUrl');

    if (!kIsWeb) {
      final htmlContent = '''
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: black; overflow: hidden; }
          iframe { width: 100vw; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe src="$embedUrl" allow="autoplay; fullscreen" allowfullscreen></iframe>
      </body>
      </html>
      ''';

      controller.loadHtmlString(
        htmlContent,
        baseUrl: 'https://mathspoint.co.in',
      );
    } else {
      controller.loadRequest(
        Uri.parse(embedUrl),
      );
    }

// Chrome / Flutter Web does not reliably trigger
// the native WebView page-finished callback.
if (kIsWeb) {
  Future.delayed(
    const Duration(seconds: 2),
    () {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    },
  );
}

_webViewController = controller;

    _progressTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _saveProgress(),
    );
  }

  // ============================================================
  // PROGRESS
  // ============================================================

  Future<void> _saveProgress() async {
    // Flutter Web currently reports:
    // UnimplementedError: runJavaScriptReturningResult
    // is not implemented on the current platform.
    //
    // Do not run this on Chrome. It will work on native
    // Android/iOS WebView where supported.
    if (kIsWeb) {
      return;
    }

    final controller = _webViewController;
    final lessonId = widget.lessonId;

    if (controller == null || lessonId == null) {
      return;
    }

    try {
      final result =
          await controller.runJavaScriptReturningResult(
        'getProgress()',
      );

      final progress =
          double.tryParse(result.toString()) ?? 0;

      if (progress <= 0) {
        return;
      }

      await _apiService.updateLessonProgress(
        lessonId,
        progress: progress.clamp(0, 100),
        watchDuration: 30,
      );
    } catch (e) {
      debugPrint(
        'Progress save error: $e',
      );
    }
  }

  // ============================================================
  // FULLSCREEN
  // ============================================================

  Future<void> _toggleFullscreen() async {
    if (_isFullscreen) {
      await _restorePortrait();
    } else {
      await SystemChrome.setEnabledSystemUIMode(
        SystemUiMode.immersiveSticky,
      );

      await SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
    }

    if (mounted) {
      setState(() {
        _isFullscreen = !_isFullscreen;
      });
    }
  }

  Future<void> _restorePortrait() async {
    await SystemChrome.setEnabledSystemUIMode(
      SystemUiMode.edgeToEdge,
    );

    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
  }

  // ============================================================
  // LESSON DATA
  // ============================================================

  Map<String, dynamic> get _displayLesson {
    final dataLesson = _playerData?['lesson'];

    if (dataLesson is Map) {
      return Map<String, dynamic>.from(dataLesson);
    }

    return widget.initialLesson ?? {};
  }

  String _cleanError(String message) {
    final cleaned =
        message.replaceFirst('Exception: ', '');

    if (cleaned.contains('YOUTUBE_VIDEO_CONFIG') ||
        cleaned.contains('LESSON_VIDEO_UNCONFIGURED')) {
      return 'This lesson has no YouTube video configured. '
          'Add a YouTube link in admin panel.';
    }

    return cleaned;
  }

  // ============================================================
  // BUILD
  // ============================================================

  @override
  Widget build(BuildContext context) {
    final body = widget.lessonId == null
        ? _buildError('No lesson selected.')
        : FutureBuilder<Map<String, dynamic>>(
            future: _playerFuture,
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                _playerData = snapshot.data;
              }

              if (snapshot.connectionState ==
                      ConnectionState.waiting &&
                  _playerData == null) {
                return const Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF38BDF8),
                  ),
                );
              }

              if (snapshot.hasError) {
                return _buildError(
                  _cleanError(
                    snapshot.error.toString(),
                  ),
                );
              }

              return _buildPlayer();
            },
          );

    return Scaffold(
      backgroundColor: const Color(0xFF050816),
      appBar: _isFullscreen
          ? null
          : AppBar(
              backgroundColor: const Color(0xFF0F172A),
              foregroundColor: Colors.white,
              title: Text(
                (
                  _displayLesson['title'] ??
                      'Video Lecture'
                ).toString(),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              actions: [
                IconButton(
                  tooltip: 'Fullscreen',
                  icon: const Icon(
                    Icons.fullscreen_rounded,
                  ),
                  onPressed: _toggleFullscreen,
                ),
              ],
            ),
      body: SafeArea(
        top: !_isFullscreen,
        child: body,
      ),
    );
  }

  // ============================================================
  // PLAYER UI
  // ============================================================

  Widget _buildPlayer() {
    final lesson = _displayLesson;

    final embedUrl =
        (_playerData?['embedUrl'] ?? '').toString();

    if (embedUrl.isEmpty) {
      return _buildError(
        'No YouTube video configured for this lesson.',
      );
    }

    /*
     * Initialize only once.
     */
    if (_webViewController == null) {
      _initializeWebView(embedUrl);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AspectRatio(
          aspectRatio: 16 / 9,
          child: Stack(
            children: [
              Container(
                color: Colors.black,
                child: _webViewController != null
                    ? WebViewWidget(
                        controller: _webViewController!,
                      )
                    : const SizedBox.shrink(),
              ),

              if (_isLoading)
                const Center(
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3,
                  ),
                ),

              if (!_isLoading)
                Positioned(
                  bottom: 4,
                  right: 4,
                  child: IconButton(
                    icon: Icon(
                      _isFullscreen
                          ? Icons.fullscreen_exit_rounded
                          : Icons.fullscreen_rounded,
                      color: Colors.white70,
                      size: 28,
                    ),
                    onPressed: _toggleFullscreen,
                  ),
                ),
            ],
          ),
        ),

        if (!_isFullscreen)
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Text(
                    (
                      lesson['title'] ??
                          'Video Lecture'
                    ).toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    (
                      lesson['description'] ?? ''
                    ).toString(),
                    style: TextStyle(
                      color: Colors.white.withValues(
                        alpha: 0.68,
                      ),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  // ============================================================
  // ERROR UI
  // ============================================================

  Widget _buildError(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          message.replaceFirst(
            'Exception: ',
            '',
          ),
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}
