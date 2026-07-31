import 'package:flutter/material.dart';
import '../../widgets/custom_thumbnail.dart';


class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  int _selectedTabIndex = 0;
  final List<String> _tabs = ['Overview', 'Notes', 'Doubt'];

  final List<Map<String, dynamic>> _lectures = [
    {'title': 'Introduction', 'completed': true, 'current': false},
    {'title': 'Standard Form of Quadratic Eq.', 'completed': true, 'current': false},
    {'title': 'Nature of Roots', 'completed': true, 'current': false},
    {'title': 'Discriminant', 'completed': true, 'current': false},
    {'title': 'Solving Quadratic Equations', 'completed': false, 'current': true},
    {'title': 'Word Problems', 'completed': false, 'current': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            _buildVideoPlayerPlaceholder(context),
            _buildTabs(),
            Expanded(
              child: _selectedTabIndex == 0 ? _buildOverviewContent() : const Center(child: Text('Content')),
            ),
            _buildMarkCompleteButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoPlayerPlaceholder(BuildContext context) {
    return Container(
      height: 220,
      width: double.infinity,
      color: Colors.black,
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomThumbnail(
              title: widget.course['title'] ?? 'Maths Point',
              isPlayable: true,
              borderRadius: 0,
            ),
          ),
          Positioned(
            top: 16,
            left: 16,
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Positioned(
            top: 16,
            right: 16,
            child: IconButton(
              icon: const Icon(Icons.bookmark_border, color: Colors.white),
              onPressed: () {},
            ),
          ),
          const Center(
            child: Icon(Icons.play_circle_fill, color: Colors.white, size: 60),
          ),
          Positioned(
            bottom: 16,
            left: 16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Quadratic Equations',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Lecture 05',
                  style: TextStyle(color: Colors.grey[300], fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      child: Row(
        children: List.generate(_tabs.length, (index) {
          final isSelected = _selectedTabIndex == index;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedTabIndex = index),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isSelected ? Theme.of(context).primaryColor : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  _tabs[index],
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isSelected ? Theme.of(context).primaryColor : Colors.grey[600],
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildOverviewContent() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Lecture Content',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ..._lectures.asMap().entries.map((entry) {
          final index = entry.key;
          final lecture = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: EdgeInsets.all(lecture['current'] ? 12 : 0),
            decoration: lecture['current']
                ? BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  )
                : null,
            child: Row(
              children: [
                Text(
                  '0${index + 1}',
                  style: TextStyle(
                    color: lecture['current'] ? Theme.of(context).primaryColor : Colors.grey[500],
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    lecture['title'],
                    style: TextStyle(
                      color: lecture['current'] ? Theme.of(context).primaryColor : Colors.black87,
                      fontWeight: lecture['current'] ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
                if (lecture['completed'])
                  Icon(Icons.check_circle_outline, color: Theme.of(context).primaryColor, size: 20)
                else if (lecture['current'])
                  Icon(Icons.play_circle_outline, color: Theme.of(context).primaryColor, size: 20)
                else
                  Icon(Icons.circle_outlined, color: Colors.grey[300], size: 20),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildMarkCompleteButton() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () {},
          child: const Text(
            'Mark as Complete',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
