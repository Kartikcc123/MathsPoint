import 'package:flutter/material.dart';
import 'chapter_content_screen.dart';

class SubjectDetailScreen extends StatelessWidget {
  final String subjectName;
  final List<dynamic> chapters;
  final String? courseId;

  const SubjectDetailScreen({
    super.key,
    required this.subjectName,
    required this.chapters,
    this.courseId,
  });

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
            subjectName,
            style: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          actions: [
            Container(
              margin: const EdgeInsets.only(right: 16),
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
          ],
          bottom: const TabBar(
            labelColor: Color(0xFF6366F1), // Indigo
            unselectedLabelColor: Colors.grey,
            indicatorColor: Color(0xFF6366F1),
            indicatorWeight: 3,
            labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
            tabs: [
              Tab(text: 'Chapters'),
              Tab(text: 'Study Material'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildChaptersTab(),
            _buildStudyMaterialTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildChaptersTab() {
    if (chapters.isEmpty) {
      return const Center(
        child: Text(
          'No chapters available.',
          style: TextStyle(color: Colors.grey, fontSize: 16),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: chapters.length,
      itemBuilder: (context, index) {
        final chapterName = chapters[index].toString();
        final chapterNumber = (index + 1).toString().padLeft(2, '0');

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChapterContentScreen(
                    chapterName: chapterName,
                    courseId: courseId,
                  ),
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'CH - $chapterNumber',
                            style: const TextStyle(
                              color: Colors.blue,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          chapterName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Lectures : 0/0',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: Colors.grey),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStudyMaterialTab() {
    return const Center(
      child: Text(
        'Study Material will be available here.',
        style: TextStyle(color: Colors.grey, fontSize: 16),
      ),
    );
  }
}
