import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';
import '../dashboard/course_description_screen.dart';
import '../../widgets/custom_thumbnail.dart';

class CoursesScreen extends StatefulWidget {
  final int initialClassIndex;
  const CoursesScreen({super.key, this.initialClassIndex = 0});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  late int _selectedClassIndex;
  int _selectedCategoryIndex = 0; // All

  final List<String> _classes = ['All', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Others'];
  final List<String> _categories = ['All', 'Algebra', 'Calculus', 'Coordinate Geo'];

  late Future<List<dynamic>> _coursesFuture;

  @override
  void initState() {
    super.initState();
    _selectedClassIndex = widget.initialClassIndex;
    _coursesFuture = ApiService().getPublicCourses();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1F2937),
        elevation: 0,
        title: const Text('Courses', style: TextStyle(color: Color(0xFF1F2937))),
        leading: Navigator.canPop(context) ? IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF1F2937)),
          onPressed: () => Navigator.pop(context),
        ) : null,
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Color(0xFF1F2937)),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          _buildClassTabs(),
          _buildCategoryTabs(),
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: _coursesFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No courses available.'));
                }

                final allCourses = snapshot.data!;
                final selectedClass = _classes[_selectedClassIndex].toLowerCase();
                final selectedCategory = _categories[_selectedCategoryIndex].toLowerCase();

                final courses = allCourses.where((course) {
                  final title = (course['title'] ?? '').toString().toLowerCase();
                  final desc = (course['description'] ?? '').toString().toLowerCase();
                  final subjects = (course['subjects'] as List<dynamic>?)?.map((e) => e.toString().toLowerCase()).toList() ?? [];

                  bool matchesClass = false;
                  if (selectedClass == 'all') {
                    matchesClass = true;
                  } else if (selectedClass == 'others') {
                    matchesClass = !title.contains('class 9') && 
                                   !title.contains('class 10') && 
                                   !title.contains('class 11') && 
                                   !title.contains('class 12') &&
                                   !desc.contains('class 9') && 
                                   !desc.contains('class 10') && 
                                   !desc.contains('class 11') && 
                                   !desc.contains('class 12');
                  } else {
                    matchesClass = title.contains(selectedClass) || desc.contains(selectedClass);
                  }
                  
                  bool matchesCategory = selectedCategory == 'all' || 
                      subjects.any((s) => s.contains(selectedCategory)) || 
                      title.contains(selectedCategory) || 
                      desc.contains(selectedCategory);

                  return matchesClass && matchesCategory;
                }).toList();

                if (courses.isEmpty) {
                  return const Center(child: Text('No courses found for selected filters.'));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: courses.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) => _buildCourseItem(courses[index] as Map<String, dynamic>),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClassTabs() {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _classes.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedClassIndex == index;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedClassIndex = index;
              });
            },
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? Theme.of(context).primaryColor : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(
                child: Text(
                  _classes[index],
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.grey[600],
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoryTabs() {
    return Container(
      height: 48,
      margin: const EdgeInsets.only(top: 16),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedCategoryIndex == index;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedCategoryIndex = index;
              });
            },
            child: Container(
              margin: const EdgeInsets.only(right: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _categories[index],
                    style: TextStyle(
                      color: isSelected ? Theme.of(context).primaryColor : Colors.grey[500],
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  if (isSelected)
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      height: 2,
                      width: 24,
                      color: Theme.of(context).primaryColor,
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCourseItem(Map<String, dynamic> course) {
    final title = course['title'] ?? 'PW Prodigy Velocity 2026';
    final duration = course['duration'] ?? 'Started on 19th Jun\'26';
    final fee = course['feeAmount'] != null && course['feeAmount'] > 0 
        ? '₹${course['feeAmount']}' 
        : 'Free';
    final imageUrl = (course['thumbnail'] != null && course['thumbnail'].toString().trim().isNotEmpty)
        ? course['thumbnail'] 
        : null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: CustomThumbnail(
                imageUrl: imageUrl,
                title: title,
                borderRadius: 0,
              ),
            ),
          ),
          
          // Content Padding
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Target & Hinglish badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Target',
                      style: TextStyle(
                        color: Color(0xFFF97316), // Orange color
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[400]!),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'HINGLISH',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 12),
                
                // Exam Target Info
                Row(
                  children: [
                    Icon(Icons.menu_book_outlined, size: 16, color: Colors.grey[700]),
                    const SizedBox(width: 8),
                    Text(
                      'Exam Target',
                      style: TextStyle(color: Colors.grey[700], fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                
                // Date Info
                Row(
                  children: [
                    Icon(Icons.calendar_today_outlined, size: 16, color: Colors.grey[700]),
                    const SizedBox(width: 8),
                    Text(
                      duration,
                      style: TextStyle(color: Colors.grey[700], fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Bottom Action Row
                Row(
                  children: [
                    Text(
                      fee,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const Spacer(),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1F2937), // Dark button
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Enroll Now', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.chevron_right, color: Color(0xFF1F2937)),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CourseDescriptionScreen(course: course),
                            ),
                          );
                        },
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
}
