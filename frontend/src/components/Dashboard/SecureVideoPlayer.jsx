import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Loader2, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

/**
 * SecureVideoPlayer — Custom video player using YouTube IFrame API
 * Displays custom React controls while playing a YouTube video in the background.
 */
const SecureVideoPlayer = ({ embedUrl, lessonTitle, onProgress, isLoading, debug = false }) => {
  const containerRef = useRef(null);
  const playerDivRef = useRef(null);
  const [playerInstance, setPlayerInstance] = useState(null);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Parse and validate embed URL
  const validateEmbedUrl = useCallback((url) => {
    if (!url) return { valid: false, error: 'No embed URL provided' };
    try {
      let vidId = null;
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace('www.', '');
      
      if (hostname === 'youtu.be') {
        vidId = parsed.pathname.slice(1);
      } else if (['youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
        if (parsed.pathname.startsWith('/embed/')) {
          vidId = parsed.pathname.replace('/embed/', '').split('/')[0];
        } else if (parsed.pathname === '/watch') {
          vidId = parsed.searchParams.get('v');
        }
      }

      if (!vidId || !/^[a-zA-Z0-9_-]{11}$/.test(vidId)) {
        return { valid: false, error: `Invalid YouTube URL: ${url}` };
      }
      return { valid: true, videoId: vidId };
    } catch (e) {
      return { valid: false, error: `URL parse error: ${e.message}` };
    }
  }, []);

  useEffect(() => {
    if (embedUrl) {
      const validation = validateEmbedUrl(embedUrl);
      if (validation.valid) {
        setVideoId(validation.videoId);
        setError(null);
      } else {
        setError(validation.error);
      }
    }
  }, [embedUrl, validateEmbedUrl]);

  // Load YouTube API
  const loadYouTubeAPI = () => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }
      if (!document.getElementById('youtube-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          resolve();
        }
      }, 100);
    });
  };

  // Initialize Player
  useEffect(() => {
    if (!videoId || !playerDivRef.current) return;

    let player;
    loadYouTubeAPI().then(() => {
      player = new window.YT.Player(playerDivRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0, // Disable native controls
          disablekb: 1, // Disable keyboard shortcuts natively
          fs: 0, // Disable native fullscreen
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3, // Hide annotations
        },
        events: {
          onReady: (event) => {
            setPlayerInstance(event.target);
            setDuration(event.target.getDuration() || 0);
            setVolume(event.target.getVolume());
            setIsMuted(event.target.isMuted());
            setIsReady(true);
            startTimeRef.current = Date.now();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(event.target.getDuration()); // Ensure we have the correct duration
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId]);

  // Handle current time update
  useEffect(() => {
    if (isPlaying && playerInstance) {
      timeUpdateIntervalRef.current = setInterval(() => {
        setCurrentTime(playerInstance.getCurrentTime());
      }, 500);
    } else {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    }
    return () => {
      if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
    };
  }, [isPlaying, playerInstance]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && playerInstance) {
        playerInstance.pauseVideo();
      }
    };
    const handleWindowBlur = () => {
      if (isPlaying && playerInstance) {
        playerInstance.pauseVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isPlaying, playerInstance]);

  // Estimated progress tracking for the backend
  useEffect(() => {
    if (!embedUrl || !onProgress) return;

    progressIntervalRef.current = setInterval(() => {
      if (isPlaying && startTimeRef.current) {
        // We pass actual watched seconds since start of this session.
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onProgress(elapsedSeconds);
      }
    }, 30000);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [embedUrl, onProgress, isPlaying]);

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Anti-copy protections
  useEffect(() => {
    const preventContextMenu = (e) => {
      if (e.target.closest('.lesson-player-container')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  const togglePlay = () => {
    if (!playerInstance) return;
    if (isPlaying) {
      playerInstance.pauseVideo();
    } else {
      playerInstance.playVideo();
    }
  };

  const handleSeek = (e) => {
    const seekTo = parseFloat(e.target.value);
    setCurrentTime(seekTo);
    if (playerInstance) {
      playerInstance.seekTo(seekTo, true);
    }
  };

  const toggleMute = () => {
    if (!playerInstance) return;
    if (isMuted) {
      playerInstance.unMute();
      setIsMuted(false);
      setVolume(playerInstance.getVolume());
    } else {
      playerInstance.mute();
      setIsMuted(true);
      setVolume(0);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (playerInstance) {
      playerInstance.setVolume(newVol);
      if (newVol > 0 && isMuted) {
        playerInstance.unMute();
        setIsMuted(false);
      } else if (newVol === 0 && !isMuted) {
        playerInstance.mute();
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setIsControlsVisible(false);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (playerInstance) {
          const newTime = Math.min(currentTime + 5, duration);
          playerInstance.seekTo(newTime, true);
          setCurrentTime(newTime);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (playerInstance) {
          const newTime = Math.max(currentTime - 5, 0);
          playerInstance.seekTo(newTime, true);
          setCurrentTime(newTime);
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerInstance, currentTime, duration, isPlaying, isMuted]);

  // Force show controls when paused
  useEffect(() => {
    if (!isPlaying) setIsControlsVisible(true);
  }, [isPlaying]);

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-sm text-slate-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="lesson-player-container relative w-full aspect-video bg-slate-950 lg:rounded-2xl overflow-hidden shadow-2xl shadow-black/40 group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Loading Overlay */}
      {(isLoading || !isReady) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading secure player...</p>
          </div>
        </div>
      )}

      {/* 
        IMPORTANT: The iframe container is absolute.
        We apply pointer-events-none to a wrapper over the iframe so it cannot be clicked directly.
      */}
      <div className="absolute inset-0 z-0">
        <div ref={playerDivRef} className="w-full h-full pointer-events-none"></div>
      </div>

      {/* Transparent Click Shield */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer" 
        onClick={togglePlay} 
        onDoubleClick={toggleFullscreen}
      />

      {/* Big Play Button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 bg-sky-500/80 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(14,165,233,0.4)] pointer-events-auto cursor-pointer transition-transform hover:scale-110 hover:bg-sky-500" onClick={togglePlay}>
            <Play className="h-10 w-10 text-white ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 py-3 pb-4 transition-opacity duration-300 flex flex-col gap-3 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="flex items-center group/progress h-5 relative cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          const seekTo = percent * duration;
          setCurrentTime(seekTo);
          if (playerInstance) playerInstance.seekTo(seekTo, true);
        }}>
          {/* Base track */}
          <div className="absolute left-0 right-0 h-1.5 bg-white/20 rounded-full overflow-hidden transition-all group-hover/progress:h-2">
            {/* Loaded track */}
            <div 
              className="absolute top-0 left-0 bottom-0 bg-white/40" 
              style={{ width: `${(playerInstance?.getVideoLoadedFraction() || 0) * 100}%` }}
            />
            {/* Played track */}
            <div 
              className="absolute top-0 left-0 bottom-0 bg-sky-500" 
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          {/* Scrubber Knob */}
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div 
            className="absolute h-3 w-3 bg-white rounded-full shadow transition-all group-hover/progress:scale-125 opacity-0 group-hover/progress:opacity-100"
            style={{ 
              left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              transform: 'translateX(-50%)',
              top: '50%',
              marginTop: '-6px'
            }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={togglePlay} className="text-white hover:text-sky-400 transition-colors">
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
            </button>

            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-white hover:text-sky-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input 
                type="range" 
                min={0} 
                max={100} 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-300 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div className="text-white text-xs lg:text-sm font-medium tracking-wide">
              {formatTime(currentTime)} <span className="text-white/50 mx-1">/</span> {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleFullscreen} className="text-white hover:text-sky-400 transition-colors">
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Title overlay at top when hovered */}
      {lessonTitle && (
        <div className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4 pb-8 transition-opacity duration-300 pointer-events-none ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <h2 className="text-white font-semibold truncate text-sm lg:text-base">{lessonTitle}</h2>
        </div>
      )}
    </div>
  );
};

export default SecureVideoPlayer;
