import 'package:flutter/material.dart';
import 'subject_detail_screen.dart';

class EnrolledCourseDetailScreen extends StatelessWidget {
  final Map<String, dynamic> course;

  const EnrolledCourseDetailScreen({super.key, required this.course});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black87, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            course['title'] ?? 'Course Details',
            style: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          actions: [
            Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Text('XP', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue, fontSize: 12)),
                  SizedBox(width: 4),
                  Text('0', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.chat_bubble_outline, color: Colors.black87),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.notifications_none, color: Colors.black87),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.more_vert, color: Colors.black87),
              onPressed: () {},
            ),
          ],
          bottom: const TabBar(
            labelColor: Color(0xFF6366F1), // Indigo
            unselectedLabelColor: Colors.black87,
            indicatorColor: Color(0xFF6366F1),
            indicatorWeight: 3,
            labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
            tabs: [
              Tab(text: 'Description'),
              Tab(text: 'Subjects'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildDescriptionTab(context),
            _buildSubjectsTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildDescriptionTab(BuildContext context) {
    final description = course['description'] ?? 'This course covers the entire syllabus for the selected class. It includes comprehensive video lectures, study materials, and tests.';
    
    final faqSplit = description.split("FAQ's");
    final featuresText = faqSplit[0].trim();
    final faqText = faqSplit.length > 1 ? faqSplit[1].trim() : '';

    List<Map<String, String>> parsedFaqs = [];
    if (faqText.isNotEmpty) {
      final qnaPairs = faqText.split(RegExp(r'\n\s*\n'));
      for (var pair in qnaPairs) {
        final qMatch = RegExp(r'^Q:\s*(.*)', multiLine: true).firstMatch(pair);
        final aMatch = RegExp(r'^A:\s*(.*)', multiLine: true).firstMatch(pair);
        if (qMatch != null && aMatch != null) {
          parsedFaqs.add({
            'q': qMatch.group(1) ?? '',
            'a': aMatch.group(1) ?? '',
          });
        }
      }
    }

    final hasEmojis = featuresText.contains('🗓️') || featuresText.contains('⭐') || featuresText.contains('📚');
    List<Widget> featureWidgets = [];
    
    if (hasEmojis) {
      final lines = featuresText.split('\n');
      for (int i = 0; i < lines.length; i++) {
        String line = lines[i].trim();
        if (line.isEmpty) continue;
        
        IconData? iconData;
        Color iconColor = Colors.grey.shade600;
        if (line.startsWith('🗓️')) {
          iconData = Icons.calendar_today_rounded;
          iconColor = const Color(0xFF3B82F6);
          line = line.replaceFirst('🗓️', '').trim();
        } else if (line.startsWith('⭐')) {
          iconData = Icons.star_rounded;
          iconColor = const Color(0xFFF59E0B);
          line = line.replaceFirst('⭐', '').trim();
        } else if (line.startsWith('📚')) {
          iconData = Icons.auto_stories_rounded;
          iconColor = const Color(0xFF8B5CF6);
          line = line.replaceFirst('📚', '').trim();
        }
        
        if (iconData != null) {
          featureWidgets.add(
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: iconColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(iconData, size: 16, color: iconColor),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        line,
                        style: const TextStyle(fontSize: 14, color: Color(0xFF374151), height: 1.4),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        } else {
          featureWidgets.add(
            Padding(
              padding: const EdgeInsets.only(left: 46.0, bottom: 4.0),
              child: Text(
                line,
                style: TextStyle(fontSize: 14, color: Colors.grey.shade600, height: 1.5),
              ),
            ),
          );
        }
      }
    } else {
      featureWidgets.add(
        Text(
          featuresText,
          style: const TextStyle(
            fontSize: 15,
            color: Colors.black87,
            height: 1.6,
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // About this course — premium card
          Container(
            padding: const EdgeInsets.all(20),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: const Icon(Icons.info_outline_rounded, size: 18, color: Color(0xFF6366F1)),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'About this course',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ...featureWidgets,
              ],
            ),
          ),
          
          if (parsedFaqs.isNotEmpty) ...[
            const SizedBox(height: 32),
            const Text(
              "FAQ's",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
            ...parsedFaqs.map((faq) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Material(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(8),
                    child: Theme(
                      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                      child: ExpansionTile(
                        title: Text(
                          faq['q']!,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                            color: Colors.black87,
                          ),
                        ),
                        childrenPadding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                        expandedCrossAxisAlignment: CrossAxisAlignment.start,
                        expandedAlignment: Alignment.centerLeft,
                        children: [
                          Text(
                            faq['a']!,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.black54,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )),
          ],
          
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSubjectsTab() {
    final List<dynamic> rawSubjects = course['subjects'] ?? [];
    
    if (rawSubjects.isEmpty) {
      return const Center(
        child: Text(
          'No subjects available for this course.',
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
      );
    }

    final List<Map<String, dynamic>> subjects = rawSubjects.map((s) {
      final name = s.toString();
      final code = name.length >= 2 ? name.substring(0, 2) : name;
      return {'name': name, 'code': code, 'color': Colors.blue};
    }).toList();

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: subjects.length,
      itemBuilder: (context, index) {
        final subject = subjects[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () {
                final courseChapters = course['chapters'] as Map<String, dynamic>? ?? {};
                final subjectChapters = courseChapters[subject['name']] as List<dynamic>? ?? [];

                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => SubjectDetailScreen(
                      subjectName: subject['name'],
                      chapters: subjectChapters,
                      courseId: course['_id'],
                    ),
                  ),
                );
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          subject['code'],
                          style: TextStyle(
                            color: Colors.blue.shade700,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        subject['name'],
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: Colors.grey),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
