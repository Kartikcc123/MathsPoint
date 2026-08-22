import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';
import 'package:intl/intl.dart';
import 'video_player_screen.dart';
import 'package:url_launcher/url_launcher.dart';

class ChapterContentScreen extends StatefulWidget {
  final String chapterName;
  final String? courseId;

  const ChapterContentScreen({
    super.key, 
    required this.chapterName,
    this.courseId,
  });

  @override
  State<ChapterContentScreen> createState() => _ChapterContentScreenState();
}

class _ChapterContentScreenState extends State<ChapterContentScreen> {
  String _selectedFilter = 'All';
  final List<String> _filters = ['All', 'Lectures', 'Notes'];
  
  final ApiService _apiService = ApiService();
  List<dynamic> _materials = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMaterials();
  }

  Future<void> _fetchMaterials() async {
    setState(() => _isLoading = true);
    
    // Fetch materials (PDFs/Notes)
    final allMaterials = await _apiService.getStudentMaterials();
    
    // Fetch lessons (Videos)
    List<dynamic> allLessons = [];
    if (widget.courseId != null) {
      allLessons = await _apiService.getCourseLessons(widget.courseId!);
    }
    
    setState(() {
      final filteredMaterials = allMaterials.where((m) => m['moduleName'] == widget.chapterName).toList();
      
      final filteredLessons = allLessons
          .where((l) => l['moduleTitle'] == widget.chapterName)
          .map((l) => {
                ...l as Map<String, dynamic>,
                'type': 'Video',
                'fileUrl': 'lesson', // placeholder to indicate it's a lesson
              })
          .toList();
          
      _materials = [...filteredLessons, ...filteredMaterials];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black87, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.chapterName,
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
              color: Colors.blue.withValues(alpha: 0.1),
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
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Divider(height: 1),
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: _filters.map((filter) {
                final isSelected = _selectedFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _selectedFilter = filter;
                      });
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF4B5563) : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF4B5563) : Colors.grey.shade300,
                        ),
                      ),
                      child: Text(
                        filter,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black87,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          
          // Content List
          Expanded(
            child: _buildFilteredContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilteredContent() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    List<Widget> items = [];
    
    for (var material in _materials) {
      final type = material['type'] ?? 'Notes';
      if (_selectedFilter == 'All') {
        if (type == 'Video') {
          items.add(_buildLectureCard(material));
        } else {
          items.add(_buildNoteCard(material));
        }
      } else if (_selectedFilter == 'Lectures' && type == 'Video') {
        items.add(_buildLectureCard(material));
      } else if (_selectedFilter == 'Notes' && type != 'Video') {
        items.add(_buildNoteCard(material));
      }
    }

    if (items.isEmpty) {
      return const Center(child: Text('No materials found.'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        return items[index];
      },
    );
  }

  Widget _buildLectureCard(Map<String, dynamic> material) {
    final title = material['title'] ?? 'Lecture';
    final date = material['createdAt'] != null 
        ? DateFormat('dd MMM yyyy').format(DateTime.parse(material['createdAt']))
        : '';
        
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail
              Stack(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Icon(Icons.play_arrow_rounded, size: 50, color: Colors.green.shade700),
                    ),
                  ),
                  Positioned(
                    bottom: -4,
                    right: -4,
                    child: Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                      child: const Icon(Icons.play_circle_fill, color: Colors.red, size: 24),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              // Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Lecture • $date',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Icon(Icons.check_circle_outline, size: 16, color: Colors.grey.shade600),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      material['duration'] != null ? '${(material['duration'] / 60).floor()}m' : 'Video',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Action Buttons
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: IconButton(
                  icon: const Icon(Icons.download_outlined, color: Colors.black54),
                  onPressed: () {},
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: () {},
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'Notes, DPP & ...',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: () async {
                    final fileUrl = material['fileUrl'] ?? '';
                    
                    if (fileUrl == 'lesson') {
                      // It's a YouTube Lesson
                      showDialog(
                        context: context, 
                        barrierDismissible: false,
                        builder: (_) => const Center(child: CircularProgressIndicator()),
                      );
                      
                      try {
                        final lessonData = await _apiService.getLessonPlayer(material['_id']);
                        final embedUrl = lessonData['embedUrl'];
                        if (context.mounted) Navigator.pop(context); // Close loading
                        
                        if (embedUrl != null) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => VideoPlayerScreen(
                                videoUrl: embedUrl,
                                title: title,
                                isYouTube: true,
                              ),
                            ),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load video: $e')));
                        }
                      }
                    } else {
                      // It's a local/streamed video
                      final videoUrl = fileUrl.startsWith('local:') 
                          ? _apiService.getMaterialStreamUrl(material['_id'])
                          : fileUrl;
                          
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => VideoPlayerScreen(
                            videoUrl: videoUrl,
                            title: title,
                            isYouTube: false,
                          ),
                        ),
                      );
                    }
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.play_circle, size: 18, color: Colors.black87),
                        SizedBox(width: 6),
                        Text(
                          'Watch',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNoteCard(Map<String, dynamic> material) {
    final title = material['title'] ?? 'Note';
    final date = material['createdAt'] != null 
        ? DateFormat('dd MMM yyyy').format(DateTime.parse(material['createdAt']))
        : '';
        
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Icon(Icons.picture_as_pdf, size: 40, color: Colors.red.shade600),
                ),
              ),
              const SizedBox(width: 12),
              // Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Note • $date',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Document',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Action Buttons
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: IconButton(
                  icon: const Icon(Icons.download_outlined, color: Colors.black54),
                  onPressed: () {},
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: () {},
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.remove_red_eye, size: 18, color: Colors.black87),
                        SizedBox(width: 6),
                        Text(
                          'View Document',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
