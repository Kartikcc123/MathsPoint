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
    _saveProgress();

    _progressTimer?.cancel();

    _restorePortrait();

    super.dispose();
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

              /*
               * Allow YouTube and required Google media resources.
               *
               * The actual player is created inside the HTML page,
               * so these resources must remain accessible.
               */

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

              /*
               * Keep navigation inside MathsPoint.
               */
              if (url.startsWith('https://mathspoint.co.in')) {
                return NavigationDecision.navigate;
              }

              return NavigationDecision.prevent;
            },
          ),
        );
    } else {
      /*
       * webview_flutter_web does not expose the same
       * native WebView configuration.
       */
      Future.delayed(
        const Duration(milliseconds: 1500),
        () {
          if (mounted) {
            setState(() {
              _isLoading = false;
            });
          }
        },
      );
    }

    /*
     * IMPORTANT
     *
     * This is the website origin that identifies the
     * embedding context to YouTube.
     */
    const origin = 'https://mathspoint.co.in';

    /*
     * loadHtmlString + baseUrl gives the HTML document
     * a real HTTPS origin/referrer context.
     */
    controller.loadRequest(
  Uri.parse(
    'http://127.0.0.1:5500/youtube-player.html?videoId=$videoId',
  ),
);

    _webViewController = controller;

    // Start progress tracking.
    _progressTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _saveProgress(),
    );
  }

  // ============================================================
  // YOUTUBE HTML PLAYER
  // ============================================================

  String _buildPlayerHtml(
    String embedUrl,
    String origin,
  ) {
    final uri = Uri.tryParse(embedUrl);

    if (uri == null) {
      return _buildErrorHtml('Invalid YouTube URL');
    }

    /*
     * Extract YouTube video ID safely.
     *
     * Supports:
     * /embed/VIDEO_ID
     * /watch?v=VIDEO_ID
     * youtu.be/VIDEO_ID
     */
    String videoId = '';

    final host = uri.host.replaceFirst(
      RegExp(r'^www\.'),
      '',
    );

    if (host == 'youtu.be') {
      if (uri.pathSegments.isNotEmpty) {
        videoId = uri.pathSegments.first;
      }
    } else if (host == 'youtube.com' ||
        host == 'youtube-nocookie.com') {
      if (uri.pathSegments.isNotEmpty &&
          uri.pathSegments.first == 'embed' &&
          uri.pathSegments.length >= 2) {
        videoId = uri.pathSegments[1];
      } else if (uri.path == '/watch') {
        videoId = uri.queryParameters['v'] ?? '';
      }
    }

    /*
     * Remove accidental query/path characters.
     */
    videoId = videoId.split('?').first.split('&').first;

    /*
     * YouTube video IDs are normally 11 characters.
     */
    if (!RegExp(r'^[a-zA-Z0-9_-]{11}$')
        .hasMatch(videoId)) {
      return _buildErrorHtml(
        'Invalid YouTube video ID',
      );
    }

    final escapedVideoId =
        _escapeJs(videoId);

    final escapedOrigin =
        _escapeJs(origin);

    return '''
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width,
             initial-scale=1.0,
             maximum-scale=1.0,
             user-scalable=no"
  >

  <!--
    Important for embedded YouTube playback.
  -->
  <meta
    name="referrer"
    content="strict-origin-when-cross-origin"
  >

  <title>MathsPoint Video Player</title>

  <style>

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }

    body {
      position: relative;
    }

    #player {
      width: 100%;
      height: 100%;
      background: #000;
    }

    iframe {
      width: 100% !important;
      height: 100% !important;
      border: 0;
    }

    #error {
      display: none;
      position: absolute;
      inset: 0;
      background: #000;
      color: #fff;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 30px;
      font-family: Arial, sans-serif;
    }

    #error-text {
      max-width: 500px;
      line-height: 1.5;
    }

  </style>

</head>

<body>

  <div id="player"></div>

  <div id="error">
    <div id="error-text"></div>
  </div>

  <script>

    var player = null;

    var currentTime = 0;

    var duration = 0;

    var playerReady = false;

    var lastError = null;

    /*
     * Load YouTube IFrame Player API.
     */
    var tag = document.createElement('script');

    tag.src = 'https://www.youtube.com/iframe_api';

    tag.async = true;

    var firstScriptTag =
      document.getElementsByTagName('script')[0];

    firstScriptTag.parentNode.insertBefore(
      tag,
      firstScriptTag
    );

    /*
     * Called by YouTube when API is ready.
     */
    function onYouTubeIframeAPIReady() {

      try {

        player = new YT.Player(
          'player',
          {
            videoId: '$escapedVideoId',

            /*
             * Standard YouTube player parameters.
             */
            playerVars: {

              autoplay: 0,

              controls: 1,

              rel: 0,

              playsinline: 1,

              enablejsapi: 1,

              fs: 1,

              iv_load_policy: 3,

              /*
               * IMPORTANT
               *
               * Identifies MathsPoint as the
               * embedding origin.
               */
              origin: '$escapedOrigin'
            },

            events: {

              onReady: function(event) {

                playerReady = true;

                try {

                  duration =
                    event.target.getDuration() || 0;

                } catch (_) {}

                startProgressTracking();

              },

              onStateChange:
                  onPlayerStateChange,

              onError:
                  onPlayerError
            }
          }
        );

      } catch (error) {

        showError(
          'Unable to initialize YouTube player.'
        );

      }

    }

    /*
     * YouTube player state.
     */
    function onPlayerStateChange(event) {

      try {

        if (player) {

          currentTime =
            player.getCurrentTime() || 0;

          duration =
            player.getDuration() || duration;

        }

      } catch (_) {}

    }

    /*
     * YouTube error handler.
     */
    function onPlayerError(event) {

      lastError = event.data;

      console.error(
        'YouTube Player Error:',
        event.data
      );

      var message =
        'Unable to play this video.';

      /*
       * YouTube error codes.
       */
      if (event.data === 2) {
        message =
          'Invalid YouTube video configuration.';
      }

      if (event.data === 5) {
        message =
          'HTML5 player error.';
      }

      if (event.data === 100) {
        message =
          'This video is unavailable or has been removed.';
      }

      if (event.data === 101 ||
          event.data === 150) {
        message =
          'This video does not allow embedding.';
      }

      if (event.data === 153) {
        message =
          'YouTube could not verify the embedding source. '
          + 'Please update the app and try again.';
      }

      showError(message);

    }

    /*
     * Display player error.
     */
    function showError(message) {

      var errorBox =
        document.getElementById('error');

      var errorText =
        document.getElementById('error-text');

      if (errorBox && errorText) {

        errorText.innerText = message;

        errorBox.style.display = 'flex';

      }

    }

    /*
     * Track current playback position.
     */
    function startProgressTracking() {

      setInterval(
        function() {

          try {

            if (player &&
                playerReady &&
                typeof player.getCurrentTime ===
                    'function') {

              currentTime =
                player.getCurrentTime() || 0;

              duration =
                player.getDuration() || duration;

            }

          } catch (_) {}

        },
        1000
      );

    }

    /*
     * Flutter calls this.
     */
    function getProgress() {

      if (duration <= 0) {
        return 0;
      }

      return Math.round(
        (currentTime / duration) * 100
      );

    }

    /*
     * Flutter calls this.
     */
    function getCurrentTime() {

      return Math.round(currentTime || 0);

    }

    /*
     * Flutter calls this.
     */
    function getDuration() {

      return Math.round(duration || 0);

    }

    /*
     * Flutter can use this for diagnostics.
     */
    function getYouTubeError() {

      return lastError || 0;

    }

  </script>

</body>

</html>
''';
  }

  String _buildErrorHtml(String message) {
    final safeMessage = _escapeHtml(message);

    return '''
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport"
      content="width=device-width, initial-scale=1.0">
<style>
html,body {
  margin:0;
  width:100%;
  height:100%;
  background:#000;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:Arial,sans-serif;
}
div {
  padding:24px;
  text-align:center;
}
</style>
</head>
<body>
<div>$safeMessage</div>
</body>
</html>
''';
  }

  String _escapeJs(String value) {
    return value
        .replaceAll('\\', '\\\\')
        .replaceAll("'", "\\'")
        .replaceAll('\n', '\\n')
        .replaceAll('\r', '\\r');
  }

  String _escapeHtml(String value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
  }

  // ============================================================
  // PROGRESS
  // ============================================================

  Future<void> _saveProgress() async {
    final controller = _webViewController;

    final lessonId = widget.lessonId;

    if (controller == null ||
        lessonId == null) {
      return;
    }

    try {
      final result =
          await controller.runJavaScriptReturningResult(
        'getProgress()',
      );

      final progress =
          double.tryParse(
                result.toString(),
              ) ??
              0;

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
    final dataLesson =
        _playerData?['lesson'];

    if (dataLesson is Map) {
      return Map<String, dynamic>.from(
        dataLesson,
      );
    }

    return widget.initialLesson ?? {};
  }

  String _cleanError(String message) {
    final cleaned =
        message.replaceFirst(
      'Exception: ',
      '',
    );

    if (cleaned.contains(
          'YOUTUBE_VIDEO_CONFIG',
        ) ||
        cleaned.contains(
          'LESSON_VIDEO_UNCONFIGURED',
        )) {
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
        ? _buildError(
            'No lesson selected.',
          )
        : FutureBuilder<Map<String, dynamic>>(
            future: _playerFuture,

            builder: (
              context,
              snapshot,
            ) {
              if (snapshot.hasData) {
                _playerData =
                    snapshot.data;
              }

              if (snapshot.connectionState ==
                      ConnectionState.waiting &&
                  _playerData == null) {
                return const Center(
                  child:
                      CircularProgressIndicator(
                    color: Color(
                      0xFF38BDF8,
                    ),
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
      backgroundColor:
          const Color(0xFF050816),

      appBar: _isFullscreen
          ? null
          : AppBar(
              backgroundColor:
                  const Color(0xFF0F172A),

              foregroundColor:
                  Colors.white,

              title: Text(
                (
                  _displayLesson['title'] ??
                      'Video Lecture'
                ).toString(),

                maxLines: 1,

                overflow:
                    TextOverflow.ellipsis,
              ),

              actions: [
                IconButton(
                  tooltip:
                      'Fullscreen',

                  icon: const Icon(
                    Icons.fullscreen_rounded,
                  ),

                  onPressed:
                      _toggleFullscreen,
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
    final lesson =
        _displayLesson;

    final embedUrl =
        (_playerData?['embedUrl'] ?? '')
            .toString();

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
      crossAxisAlignment:
          CrossAxisAlignment.start,

      children: [
        AspectRatio(
          aspectRatio: 16 / 9,

          child: Stack(
            children: [
              Container(
                color: Colors.black,

                child:
                    _webViewController != null
                        ? WebViewWidget(
                            controller:
                                _webViewController!,
                          )
                        : const SizedBox.shrink(),
              ),

              if (_isLoading)
                const Center(
                  child:
                      CircularProgressIndicator(
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
                          ? Icons
                              .fullscreen_exit_rounded
                          : Icons
                              .fullscreen_rounded,

                      color:
                          Colors.white70,

                      size: 28,
                    ),

                    onPressed:
                        _toggleFullscreen,
                  ),
                ),
            ],
          ),
        ),

        if (!_isFullscreen)
          Expanded(
            child:
                SingleChildScrollView(
              padding:
                  const EdgeInsets.all(16),

              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [
                  Text(
                    (
                      lesson['title'] ??
                          'Video Lecture'
                    ).toString(),

                    style:
                        const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight:
                          FontWeight.w700,
                    ),
                  ),

                  const SizedBox(
                    height: 8,
                  ),

                  Text(
                    (
                      lesson['description'] ??
                          ''
                    ).toString(),

                    style: TextStyle(
                      color:
                          Colors.white
                              .withValues(
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

  Widget _buildError(
    String message,
  ) {
    return Center(
      child: Padding(
        padding:
            const EdgeInsets.all(24),

        child: Text(
          message.replaceFirst(
            'Exception: ',
            '',
          ),

          textAlign:
              TextAlign.center,

          style:
              const TextStyle(
            color: Colors.white70,
            fontSize: 16,
          ),
        ),
      ),
    );
  }
}