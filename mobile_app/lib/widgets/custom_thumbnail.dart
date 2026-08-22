import 'package:flutter/material.dart';

class CustomThumbnail extends StatelessWidget {
  final String? imageUrl;
  final String title;
  final double width;
  final double height;
  final bool isPlayable;
  final double borderRadius;
  final bool showFullTitle;

  const CustomThumbnail({
    super.key,
    this.imageUrl,
    required this.title,
    this.width = double.infinity,
    this.height = double.infinity,
    this.isPlayable = false,
    this.borderRadius = 12.0,
    this.showFullTitle = false,
  });

  // Generate a consistent gradient based on the title string
  List<Color> _getGradientForTitle(String text) {
    final colors = [
      [const Color(0xFF3B82F6), const Color(0xFF1E3A8A)], // Blue
      [const Color(0xFF10B981), const Color(0xFF047857)], // Green
      [const Color(0xFF8B5CF6), const Color(0xFF4C1D95)], // Purple
      [const Color(0xFFF59E0B), const Color(0xFFB45309)], // Orange
      [const Color(0xFFEF4444), const Color(0xFF7F1D1D)], // Red
      [const Color(0xFFEC4899), const Color(0xFF831843)], // Pink
    ];
    
    if (text.isEmpty) return colors[0];
    int sum = 0;
    for (int i = 0; i < text.length; i++) {
      sum += text.codeUnitAt(i);
    }
    return colors[sum % colors.length];
  }

  String _getInitials(String text) {
    if (text.isEmpty) return 'MP';
    final parts = text.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) {
      return parts[0].substring(0, parts[0].length >= 2 ? 2 : 1).toUpperCase();
    }
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = imageUrl != null && imageUrl!.trim().isNotEmpty;
    final parsedUrl = hasImage 
        ? (imageUrl!.startsWith('http') ? imageUrl! : 'http://localhost:5000$imageUrl') 
        : null;

    final gradient = _getGradientForTitle(title);

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (parsedUrl != null)
              Image.network(
                parsedUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => _buildPlaceholder(gradient),
              )
            else
              _buildPlaceholder(gradient),
              
            if (isPlayable)
              Positioned.fill(
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.play_arrow_rounded, color: Color(0xFFE53935), size: 32),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder(List<Color> gradient) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final effectiveHeight = constraints.maxHeight.isFinite ? constraints.maxHeight : 100.0;
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: showFullTitle 
                ? Text(
                    title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      height: 1.2,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  )
                : Text(
                    _getInitials(title),
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontWeight: FontWeight.bold,
                      fontSize: effectiveHeight * 0.3,
                      letterSpacing: 2,
                    ),
                  ),
            ),
          );
        },
      ),
    );
  }
}
