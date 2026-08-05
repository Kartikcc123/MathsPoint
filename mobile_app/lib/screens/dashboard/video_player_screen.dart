import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import '../../core/services/api_service.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

class VideoPlayerScreen extends StatefulWidget {
  final String videoUrl;
  final String title;
  final bool isYouTube;

  const VideoPlayerScreen({
    super.key,
    required this.videoUrl,
    required this.title,
    this.isYouTube = false,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  VideoPlayerController? _controller;
  YoutubePlayerController? _ytController;
  
  Timer? _ytTimer;
  double _currentPosition = 0;
  double _videoDuration = 1;
  bool _isPlaying = false;
  bool _isYouTubeStarted = false;
  
  bool _showControls = true;
  bool _isFullscreen = false;
  
  final ApiService _apiService = ApiService();
  List<dynamic> _comments = [];
  bool _isLoadingComments = true;
  final TextEditingController _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    
    if (widget.isYouTube) {
      _ytController = YoutubePlayerController.fromVideoId(
        videoId: YoutubePlayerController.convertUrlToId(widget.videoUrl) ?? widget.videoUrl.split('/').last.split('?').first,
        params: const YoutubePlayerParams(
          showControls: false,
          showFullscreenButton: false,
          pointerEvents: PointerEvents.none,
        ),
      );
    } else {
      _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
        ..initialize().then((_) {
          setState(() {});
        });
        
      _controller!.addListener(() {
        if (!mounted) return;
        setState(() {
          _isPlaying = _controller!.value.isPlaying;
          _currentPosition = _controller!.value.position.inMilliseconds / 1000.0;
          final dur = _controller!.value.duration.inMilliseconds / 1000.0;
          if (dur > 0) _videoDuration = dur;
        });
      });
    }
    
    _fetchComments();
  }

  Future<void> _fetchComments() async {
    setState(() => _isLoadingComments = true);
    final comments = await _apiService.getComments(widget.title); // Using title as ID for now
    setState(() {
      _comments = comments;
      _isLoadingComments = false;
    });
  }

  Future<void> _submitComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;
    
    // Optimistic UI update
    final newComment = {
      'text': text,
      'student': {'name': 'You'},
      'createdAt': DateTime.now().toIso8601String(),
      'likes': [],
      'reports': 0,
      '_id': 'temp',
    };
    
    setState(() {
      _comments.insert(0, newComment);
      _commentController.clear();
    });
    
    try {
      final savedComment = await _apiService.addComment(widget.title, text);
      setState(() {
        final index = _comments.indexWhere((c) => c['_id'] == 'temp');
        if (index != -1) {
          _comments[index] = savedComment;
        }
      });
    } catch (e) {
      // Revert if failed
      setState(() {
        _comments.removeWhere((c) => c['_id'] == 'temp');
      });
    }
  }

  Future<void> _toggleLike(String commentId, int index) async {
    if (commentId == 'temp') return;
    await _apiService.toggleLikeComment(commentId);
    _fetchComments(); // Refresh comments to get new likes count
  }

  Future<void> _reportComment(String commentId, int index) async {
    if (commentId == 'temp') return;
    await _apiService.reportComment(commentId);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Comment reported')));
  }

  void _hideControlsTimer() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && _isPlaying) {
        setState(() {
          _showControls = false;
        });
      }
    });
  }

  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });
    if (_showControls) {
      _hideControlsTimer();
    }
  }

  void _skipBackward() {
    if (_controller != null) {
      final newPosition = _controller!.value.position - const Duration(seconds: 5);
      _controller!.seekTo(newPosition < Duration.zero ? Duration.zero : newPosition);
    } else if (_ytController != null) {
      final newPos = _currentPosition - 5;
      _ytController!.seekTo(seconds: newPos < 0 ? 0 : newPos, allowSeekAhead: true);
    }
  }

  void _skipForward() {
    if (_controller != null) {
      final newPosition = _controller!.value.position + const Duration(seconds: 5);
      _controller!.seekTo(newPosition > _controller!.value.duration ? _controller!.value.duration : newPosition);
    } else if (_ytController != null) {
      final newPos = _currentPosition + 5;
      _ytController!.seekTo(seconds: newPos > _videoDuration ? _videoDuration : newPos, allowSeekAhead: true);
    }
  }

  void _togglePlay() {
    if (_controller != null) {
      if (_controller!.value.isPlaying) {
        _controller!.pause();
      } else {
        _controller!.play();
        _hideControlsTimer();
      }
    } else if (_ytController != null) {
      if (_isPlaying) {
        _ytController!.pauseVideo();
        _isPlaying = false;
      } else {
        _ytController!.playVideo();
        _isPlaying = true;
        _hideControlsTimer();
      }
    }
    setState(() {});
  }

  void _toggleFullscreen() {
    setState(() {
      _isFullscreen = !_isFullscreen;
    });
    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeRight,
        DeviceOrientation.landscapeLeft,
      ]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
      ]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
  }
  
  void _startYoutubeTimer() {
    _ytTimer?.cancel();
    _ytTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) async {
      if (!mounted || _ytController == null) return;
      try {
        final pos = await _ytController!.currentTime;
        final dur = await _ytController!.duration;
        if (mounted) {
          setState(() {
            _currentPosition = pos;
            if (dur > 0) _videoDuration = dur;
          });
        }
      } catch (e) {
        // Ignore errors
      }
    });
  }

  @override
  void dispose() {
    _ytTimer?.cancel();
    _controller?.dispose();
    _ytController?.close();
    _commentController.dispose();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    if (duration.inHours > 0) {
      return "${twoDigits(duration.inHours)}:$twoDigitMinutes:$twoDigitSeconds";
    }
    return "$twoDigitMinutes:$twoDigitSeconds";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _isFullscreen ? Colors.black : Colors.white,
      body: SafeArea(
        top: !_isFullscreen,
        bottom: !_isFullscreen,
        child: Column(
          children: [
            // Video Player Area
            Container(
              color: Colors.black,
              constraints: BoxConstraints(
                maxHeight: _isFullscreen 
                    ? double.infinity 
                    : MediaQuery.of(context).size.height * 0.45,
              ),
              child: widget.isYouTube
                  ? Center(
                      child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          if (_isYouTubeStarted && _ytController != null)
                            YoutubePlayer(controller: _ytController!),
                          
                          if (!_isYouTubeStarted)
                            Positioned.fill(
                              child: GestureDetector(
                                onTap: () {
                                  _ytController!.playVideo();
                                  setState(() {
                                    _isYouTubeStarted = true;
                                    _isPlaying = true;
                                    _startYoutubeTimer();
                                    _hideControlsTimer();
                                  });
                                },
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    Image.network(
                                      'https://img.youtube.com/vi/${YoutubePlayerController.convertUrlToId(widget.videoUrl) ?? widget.videoUrl.split('/').last.split('?').first}/hqdefault.jpg',
                                      fit: BoxFit.cover,
                                      width: double.infinity,
                                      height: double.infinity,
                                      errorBuilder: (c, e, s) => Container(color: Colors.black),
                                    ),
                                    Container(color: Colors.black.withOpacity(0.3)),
                                    const Icon(Icons.play_circle_fill, color: Colors.white, size: 64),
                                  ],
                                ),
                              ),
                            ),
                            
                          if (_isYouTubeStarted && _showControls)
                            _buildControls(),
                        ],
                      ),
                    ),
                  )
                  : (_controller != null && _controller!.value.isInitialized
                      ? Center(
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: _toggleControls,
                            child: AspectRatio(
                              aspectRatio: _controller!.value.aspectRatio,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  VideoPlayer(_controller!),
                                  if (_showControls) _buildControls(),
                                ],
                              ),
                            ),
                          ),
                        )
                      : const Center(
                          child: AspectRatio(
                            aspectRatio: 16 / 9,
                            child: Center(
                              child: CircularProgressIndicator(color: Colors.white),
                            ),
                          ),
                        )),
            ),
            // Bottom UI (Only shown when not fullscreen)
            if (!_isFullscreen)
              Expanded(
                child: _buildBottomUI(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomUI() {
    return Column(
      children: [
        // Title and Tabs
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTabIcon(IconData icon, String label, bool isSelected) {
    return Padding(
      padding: const EdgeInsets.only(right: 24.0),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey.shade100,
              border: isSelected ? Border.all(color: Colors.blue.shade100, width: 1.5) : null,
            ),
            child: Icon(
              icon,
              size: 20,
              color: isSelected ? Colors.blue.shade700 : Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? Colors.blue.shade700 : Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      color: Colors.black.withOpacity(0.4),
      child: Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: _toggleControls,
              child: Container(color: Colors.transparent),
            ),
          ),
          
        // Top Bar
        Positioned(
          top: 0, left: 0, right: 0,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () {
                    if (_isFullscreen) {
                      _toggleFullscreen();
                    }
                    Navigator.pop(context);
                  },
                ),
                Expanded(
                  child: Text(
                    widget.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.settings, color: Colors.white),
                  onPressed: () {},
                ),
              ],
            ),
          ),
        ),

        // Center Controls
        Positioned(
          top: 0, bottom: 0, left: 0, right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(
                iconSize: 36,
                icon: const Icon(Icons.replay_5, color: Colors.white),
                onPressed: _skipBackward,
              ),
              IconButton(
                iconSize: 56,
                icon: Icon(
                  _isPlaying ? Icons.pause : Icons.play_arrow,
                  color: Colors.white,
                ),
                onPressed: _togglePlay,
              ),
              IconButton(
                iconSize: 36,
                icon: const Icon(Icons.forward_5, color: Colors.white),
                onPressed: _skipForward,
              ),
            ],
          ),
        ),

        // Bottom Bar
        Positioned(
          bottom: 0, left: 0, right: 0,
          child: Padding(
            padding: const EdgeInsets.only(left: 12, right: 12, bottom: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${_formatDuration(Duration(milliseconds: (_currentPosition * 1000).toInt()))} / ${_formatDuration(Duration(milliseconds: (_videoDuration * 1000).toInt()))}',
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                    ),
                    IconButton(
                      iconSize: 24,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      icon: Icon(
                        _isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
                        color: Colors.white,
                      ),
                      onPressed: _toggleFullscreen,
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                SliderTheme(
                  data: SliderThemeData(
                    trackHeight: 4,
                    thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                    overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
                    activeTrackColor: Colors.red,
                    inactiveTrackColor: Colors.white24,
                    thumbColor: Colors.red,
                  ),
                  child: Slider(
                    min: 0,
                    max: _videoDuration > 0 ? _videoDuration : 1,
                    value: _currentPosition.clamp(0, _videoDuration > 0 ? _videoDuration : 1),
                    onChanged: (val) {
                      setState(() => _currentPosition = val);
                    },
                    onChangeEnd: (val) {
                      if (_controller != null) {
                        _controller!.seekTo(Duration(milliseconds: (val * 1000).toInt()));
                      } else if (_ytController != null) {
                        _ytController!.seekTo(seconds: val, allowSeekAhead: true);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    ),
  );
}
}
