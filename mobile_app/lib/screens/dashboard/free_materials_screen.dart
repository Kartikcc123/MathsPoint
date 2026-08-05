import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'video_player_screen.dart';

class FreeMaterialsScreen extends StatefulWidget {
  final String section;

  const FreeMaterialsScreen({Key? key, required this.section}) : super(key: key);

  @override
  State<FreeMaterialsScreen> createState() => _FreeMaterialsScreenState();
}

class _FreeMaterialsScreenState extends State<FreeMaterialsScreen> {
  late Future<List<dynamic>> _materialsFuture;

  @override
  void initState() {
    super.initState();
    _materialsFuture = ApiService().getPublicFreeStudyMaterials(widget.section);
  }

  void _openUrl(String url, String mimeType, String title) async {
    if (url.isEmpty) return;

    // Check if it's a local upload
    if (url.startsWith('/uploads')) {
      url = 'https://mathspoint-yqnv.onrender.com$url';
    }

    if (widget.section == 'Free Videos' || mimeType == 'video/youtube') {
      bool isYouTube = url.contains('youtube.com') || url.contains('youtu.be') || mimeType == 'video/youtube';
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VideoPlayerScreen(
            videoUrl: url,
            title: title,
            isYouTube: isYouTube,
          ),
        ),
      );
      return;
    }

    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open file.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.section),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      backgroundColor: const Color(0xFFF5F7FA),
      body: FutureBuilder<List<dynamic>>(
        future: _materialsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF3284FF)));
          } else if (snapshot.hasError) {
            return const Center(child: Text('Not available at this time.'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    widget.section == 'Free Videos' ? Icons.ondemand_video : Icons.folder_open,
                    size: 64,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Not available at this time.',
                    style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                  ),
                ],
              ),
            );
          }

          final materials = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: materials.length,
            itemBuilder: (context, index) {
              final item = materials[index];
              final title = item['title'] ?? 'Untitled';
              final desc = item['description'] ?? '';
              final url = item['fileUrl'] ?? '';
              final mimeType = item['mimeType'] ?? '';

              return Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                margin: const EdgeInsets.only(bottom: 16),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3284FF).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      widget.section == 'Free Videos' ? Icons.play_arrow_rounded : Icons.description_rounded,
                      color: const Color(0xFF3284FF),
                    ),
                  ),
                  title: Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  subtitle: desc.isNotEmpty ? Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis),
                  ) : null,
                  trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.grey),
                  onTap: () => _openUrl(url, mimeType, title),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

