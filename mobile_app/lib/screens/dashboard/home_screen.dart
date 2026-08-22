import 'package:flutter/material.dart';
import 'dart:async';
import 'package:provider/provider.dart';
import 'course_description_screen.dart';
import '../../core/services/api_service.dart';
import '../../core/services/cart_manager.dart';
import '../../core/theme/theme_provider.dart';
import '../notifications/notifications_screen.dart';
import '../../widgets/custom_thumbnail.dart';
import 'free_materials_screen.dart';
import '../courses/courses_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _enrolledCourses = [];
  bool _isLoadingCourses = true;

  @override
  void initState() {
    super.initState();
    _loadEnrolledCourses();
  }

  Future<void> _loadEnrolledCourses() async {
    if (ApiService.authToken == null) {
      if (mounted) setState(() => _isLoadingCourses = false);
      return;
    }
    try {
      final dashboardData = await ApiService().getStudentDashboard();
      if (mounted) {
        setState(() {
          _enrolledCourses = dashboardData['enrolledCourses'] as List<dynamic>? ?? [];
          if (_enrolledCourses.isEmpty && dashboardData['course'] != null) {
            _enrolledCourses = [dashboardData['course']];
          }
          _isLoadingCourses = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingCourses = false);
    }
  }

  void _switchToStudyTab() {
    CartManager().switchTab?.call(0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _HeroHeader(),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildActionGrid(context),
                  const SizedBox(height: 24),
                  if (!_isLoadingCourses && _enrolledCourses.isNotEmpty) ...[
                    _buildSectionHeader(context, 'Continue Learning', action: 'View all', onAction: _switchToStudyTab),
                    const SizedBox(height: 12),
                    _buildContinueLearningCards(),
                    const SizedBox(height: 24),
                  ],
                  _buildSectionHeader(context, 'Top Courses'),
                  const SizedBox(height: 12),
                  const _TopCoursesList(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionGrid(BuildContext context) {
    final actions = [
      {'icon': Icons.videocam_rounded, 'label': 'Free\nClasses', 'color': const Color(0xFF8B5CF6)},
      {'icon': Icons.menu_book_rounded, 'label': 'Courses', 'color': const Color(0xFF3B82F6)},
      {'icon': Icons.fact_check_rounded, 'label': 'Test\nSeries', 'color': const Color(0xFF10B981)},
      {'icon': Icons.chat_rounded, 'label': 'Doubt', 'color': const Color(0xFFF59E0B)},
      {'icon': Icons.description_rounded, 'label': 'Free\nNotes', 'color': const Color(0xFFEF4444)},
      {'icon': Icons.history_edu_rounded, 'label': 'PYQ', 'color': const Color(0xFF06B6D4)},
      {'icon': Icons.edit_note_rounded, 'label': 'Practice', 'color': const Color(0xFFEC4899)},
      {'icon': Icons.grid_view_rounded, 'label': 'More', 'color': const Color(0xFF6B7280)},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: actions.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.8,
        mainAxisSpacing: 12,
      ),
      itemBuilder: (context, index) {
        final color = actions[index]['color'] as Color;
        final label = actions[index]['label'] as String;
        return GestureDetector(
          onTap: () => _handleActionTap(context, label),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  actions[index]['icon'] as IconData,
                  color: color,
                  size: 26,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 2,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF4B5563), height: 1.2),
              ),
            ],
          ),
        );
      },
    );
  }

  void _handleActionTap(BuildContext context, String label) {
    switch (label) {
      case 'Free\nClasses':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const FreeMaterialsScreen(section: 'Free Videos')));
        break;
      case 'Courses':
        // If user has purchased courses, go to Study tab; else go to Courses page
        if (_enrolledCourses.isNotEmpty) {
          _switchToStudyTab();
        } else {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const CoursesScreen()));
        }
        break;
      case 'Test\nSeries':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const FreeMaterialsScreen(section: 'Tests')));
        break;
      case 'Free\nNotes':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const FreeMaterialsScreen(section: 'Notes')));
        break;
      case 'PYQ':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const FreeMaterialsScreen(section: 'Notes')));
        break;
      case 'Practice':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const FreeMaterialsScreen(section: 'Tests')));
        break;
      case 'Doubt':
        // TODO: Add doubt screen when available
        break;
      case 'More':
        _switchToStudyTab();
        break;
    }
  }

  Widget _buildSectionHeader(BuildContext context, String title, {String action = '', VoidCallback? onAction}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF3284FF).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.local_fire_department_rounded, size: 18, color: Color(0xFF3284FF)),
            ),
            const SizedBox(width: 10),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
                letterSpacing: -0.3,
              ),
            ),
          ],
        ),
        if (action.isNotEmpty)
          GestureDetector(
            onTap: onAction,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF3284FF).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                action,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF3284FF),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildContinueLearningCards() {
    // Show max 1 recent course
    final courses = _enrolledCourses.take(1).toList();
    return Column(
      children: courses.map((course) {
        final title = course['title'] ?? course['name'] ?? 'Course';
        final thumbnail = course['thumbnail'] ?? '';
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: GestureDetector(
            onTap: () {
              _switchToStudyTab();
            },
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3284FF), Color(0xFF2563EB)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: thumbnail.isNotEmpty
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(14),
                            child: Image.network(thumbnail, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.school_rounded, color: Colors.white, size: 28)),
                          )
                        : const Icon(Icons.school_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1F2937)),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3284FF), Color(0xFF2563EB)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 22),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _HeroHeader extends StatefulWidget {
  const _HeroHeader({super.key});

  @override
  State<_HeroHeader> createState() => _HeroHeaderState();
}

class _HeroHeaderState extends State<_HeroHeader> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _timer;
  String _selectedClass = 'CBSE Class 11';
  List<dynamic> _heroAds = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchHeroAds();

    _timer = Timer.periodic(const Duration(seconds: 4), (Timer timer) {
      if (_pageController.hasClients && _heroAds.isNotEmpty) {
        int nextPage = _currentPage + 1;
        if (nextPage >= _heroAds.length) nextPage = 0;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  Future<void> _fetchHeroAds() async {
    try {
      final ads = await ApiService().getAdvertisements();
      if (mounted) {
        setState(() {
          _heroAds = ads;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF38BDF8), Color(0xFF0284C7)], // Sky blue gradient
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
          ),
          child: SafeArea(
            bottom: false,
            child: Column(
              children: [
                // Custom App Bar Row
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Current goal', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 2),
                            PopupMenuButton<String>(
                              onSelected: (String result) {
                                setState(() {
                                  _selectedClass = result;
                                });
                              },
                              offset: const Offset(0, 40),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                                const PopupMenuItem<String>(value: 'CBSE Class 9', child: Text('CBSE Class 9')),
                                const PopupMenuItem<String>(value: 'CBSE Class 10', child: Text('CBSE Class 10')),
                                const PopupMenuItem<String>(value: 'CBSE Class 11', child: Text('CBSE Class 11')),
                                const PopupMenuItem<String>(value: 'CBSE Class 12', child: Text('CBSE Class 12')),
                              ],
                              child: Container(
                                color: Colors.transparent, // Ensures the entire area is clickable
                                padding: const EdgeInsets.symmetric(vertical: 4), // Added some padding for better hit area
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Flexible(child: Text(_selectedClass, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18), overflow: TextOverflow.ellipsis)),
                                    const SizedBox(width: 4),
                                    Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 18),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Action buttons
                      Consumer<ThemeProvider>(
                        builder: (context, themeProvider, child) {
                          return GestureDetector(
                            onTap: () => themeProvider.toggleTheme(),
                            child: _buildHeaderIcon(
                              Icon(
                                themeProvider.isDarkMode ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                                color: Colors.white,
                                size: 18,
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                          );
                        },
                        child: _buildHeaderIcon(
                          const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 18),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          if (CartManager().switchTab != null) {
                            CartManager().switchTab!(3);
                          }
                        },
                        child: const CircleAvatar(
                          radius: 16,
                          backgroundColor: Color(0xFF6366F1),
                          child: Icon(Icons.person_rounded, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search_rounded, color: Colors.white.withValues(alpha: 0.8), size: 22),
                        const SizedBox(width: 10),
                        Expanded(child: Text('Search courses, tests, topics...', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 15), overflow: TextOverflow.ellipsis)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                // Carousel Banner
                SizedBox(
                  height: 180,
                  child: _isLoading 
                      ? const Center(child: CircularProgressIndicator(color: Colors.white))
                      : _heroAds.isEmpty
                          ? Center(child: Text('No banners available', style: TextStyle(color: Colors.white.withValues(alpha: 0.7))))
                          : PageView.builder(
                              controller: _pageController,
                              itemCount: _heroAds.length,
                              onPageChanged: (index) {
                                 setState(() { _currentPage = index; });
                              },
                              itemBuilder: (context, index) {
                                 return _buildHeroBanner(_heroAds[index]);
                              },
                            ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
        
        // Dots indicator
        if (!_isLoading && _heroAds.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_heroAds.length, (index) => AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: _currentPage == index ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  color: _currentPage == index ? const Color(0xFF3284FF) : const Color(0xFFD1D5DB),
                ),
              )),
            ),
          ),
      ],
    );
  }

  Widget _buildHeaderIcon(Widget child) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: child,
    );
  }

  Widget _buildHeroBanner(dynamic ad) {
    final title = (ad['title'] ?? '').toString().trim();
    final subtitle = (ad['description'] ?? '').toString().trim();
    final linkLabel = (ad['buttonText'] ?? '').toString().trim();
    
    final screenWidth = MediaQuery.of(context).size.width;
    String rawImageUrl = '';
    
    if (screenWidth >= 1200) {
      rawImageUrl = (ad['desktopImage'] ?? '').toString().trim();
    } else if (screenWidth >= 768) {
      rawImageUrl = (ad['tabletImage'] ?? '').toString().trim();
    } else {
      rawImageUrl = (ad['mobileImage'] ?? '').toString().trim();
    }
    
    final subtitles = subtitle.split(RegExp(r'[\n|]')).map((s) => s.trim()).where((s) => s.isNotEmpty).toList();

    String? imageUrl;
    if (rawImageUrl.isNotEmpty) {
      if (rawImageUrl.startsWith('http')) {
        imageUrl = rawImageUrl;
      } else {
        imageUrl = 'https://mathspoint.co.in$rawImageUrl';
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: GestureDetector(
        onTap: () {
          if (ad['_id'] != null) {
            ApiService().trackAdClick(ad['_id']);
          }
          
          final redirectLink = (ad['redirectLink'] ?? '').toString().toLowerCase();
          int classIndex = 0; // Default to 'All'
          if (redirectLink.contains('class 9')) {
            classIndex = 1;
          } else if (redirectLink.contains('class 10')) {
            classIndex = 2;
          } else if (redirectLink.contains('class 11')) {
            classIndex = 3;
          } else if (redirectLink.contains('class 12')) {
            classIndex = 4;
          } else if (redirectLink.contains('others')) {
            classIndex = 5;
          }
          
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => CoursesScreen(initialClassIndex: classIndex)),
          );
        },
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: Colors.black.withValues(alpha: 0.1),
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
            // Ad Image (if provided)
            if (imageUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => const SizedBox(),
                ),
              )
            else
              Positioned(
                right: -20,
                bottom: -20,
                child: Icon(Icons.emoji_events, size: 140, color: Colors.white.withValues(alpha: 0.15)),
              ),

            // Content Layer
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SingleChildScrollView(
                physics: const NeverScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                  if (title.isNotEmpty)
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  if (title.isNotEmpty && subtitles.isNotEmpty)
                    const SizedBox(height: 12),
                  ...subtitles.map((s) => Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, color: Colors.white, size: 16),
                        const SizedBox(width: 8),
                        Flexible(child: Text(s, style: const TextStyle(color: Colors.white, fontSize: 14))),
                      ],
                    ),
                  )),
                  if ((title.isNotEmpty || subtitles.isNotEmpty) && linkLabel.isNotEmpty)
                    const SizedBox(height: 16),
                  if (linkLabel.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(linkLabel, style: const TextStyle(color: Color(0xFF3284FF), fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                ],
              ),
              ),
            ),
          ],
        ),
        ),
      ),
    );
  }
}

class _TopCoursesList extends StatefulWidget {
  const _TopCoursesList({super.key});

  @override
  State<_TopCoursesList> createState() => _TopCoursesListState();
}

class _TopCoursesListState extends State<_TopCoursesList> {
  late Future<List<dynamic>> _coursesFuture;

  @override
  void initState() {
    super.initState();
    _coursesFuture = ApiService().getPublicCourses();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _coursesFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: Padding(
            padding: EdgeInsets.all(24.0),
            child: CircularProgressIndicator(color: Color(0xFF3284FF)),
          ));
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                children: [
                  Icon(Icons.school_rounded, size: 48, color: Colors.grey.shade300),
                  const SizedBox(height: 12),
                  Text('No courses available', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.grey.shade500)),
                ],
              ),
            ),
          );
        }

        final courses = snapshot.data!;
        
        return Column(
          children: courses.map((course) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: _buildCourseCard(context, course),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildCourseCard(BuildContext context, Map<String, dynamic> course) {
    final title = course['title'] ?? 'PW Prodigy Velocity 2026';
    final duration = course['duration'] ?? 'Started on 19th Jun\'26';
    final fee = course['feeAmount'] != null && course['feeAmount'] > 0 
        ? '₹${course['feeAmount']}' 
        : 'Free';
    final isFree = fee == 'Free';
    String? imageUrl;
    if (course['thumbnail'] != null && course['thumbnail'].toString().trim().isNotEmpty) {
      imageUrl = course['thumbnail'].toString().trim();
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: CustomThumbnail(
                    imageUrl: imageUrl,
                    title: title,
                    borderRadius: 0,
                  ),
                ),
              ),
              // Free / Premium badge
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isFree 
                        ? const Color(0xFF10B981)
                        : const Color(0xFF3284FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    isFree ? 'FREE' : 'PREMIUM',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5),
                  ),
                ),
              ),
            ],
          ),
          
          // Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 14),
                
                // Info chips
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    _buildInfoChip(Icons.menu_book_rounded, 'Exam Target'),
                    _buildInfoChip(Icons.calendar_today_rounded, duration),
                  ],
                ),
                const SizedBox(height: 20),
                
                // Bottom Action Row
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          fee,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: isFree ? const Color(0xFF10B981) : const Color(0xFF1F2937),
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    // Details button
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CourseDescriptionScreen(course: course),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.chevron_right_rounded, color: Color(0xFF6B7280), size: 22),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Enroll button
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: const LinearGradient(
                          colors: [Color(0xFF3284FF), Color(0xFF2563EB)],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF3284FF).withValues(alpha: 0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          CartManager().selectedCourse = course;
                          if (CartManager().switchTab != null) {
                            CartManager().switchTab!(2);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: const Text('Enroll Now', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: const Color(0xFF6B7280)),
          const SizedBox(width: 6),
          Flexible(child: Text(text, style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12, fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}
