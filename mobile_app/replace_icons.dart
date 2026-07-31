import 'dart:io';

void main() {
  final dir = Directory('lib');
  final files = dir.listSync(recursive: true).whereType<File>().where((f) => f.path.endsWith('.dart'));

  final Map<String, String> iconMap = {
    'bookOpen': 'menu_book_outlined',
    'edit2': 'edit_outlined',
    'award': 'emoji_events_outlined',
    'trendingUp': 'trending_up',
    'home': 'home_outlined',
    'checkSquare': 'fact_check_outlined',
    'video': 'videocam_outlined',
    'user': 'person_outline',
    'bell': 'notifications_outlined',
    'crown': 'workspace_premium_outlined',
    'messageSquare': 'chat_bubble_outline',
    'fileText': 'description_outlined',
    'fileQuestion': 'help_outline',
    'edit3': 'edit_note_outlined',
    'layoutGrid': 'grid_view_outlined',
    'code': 'code',
    'search': 'search',
    'layers': 'layers_outlined',
    'pieChart': 'pie_chart_outline',
    'fileTerminal': 'terminal_outlined',
    'calendar': 'calendar_today_outlined',
    'settings': 'settings_outlined',
    'bookmark': 'bookmark_border',
    'download': 'download_outlined',
    'helpCircle': 'help_outline',
    'logOut': 'logout',
    'arrowLeft': 'arrow_back',
    'checkCircle2': 'check_circle_outline',
    'playCircle': 'play_circle_outline',
    'circle': 'circle_outlined',
    'image': 'image_outlined',
    'filter': 'filter_alt_outlined',
    'chevronRight': 'chevron_right',
  };

  for (final file in files) {
    String content = file.readAsStringSync();
    if (content.contains('lucide_icons')) {
      content = content.replaceAll("import 'package:lucide_icons/lucide_icons.dart';", '');
      
      iconMap.forEach((lucide, material) {
        content = content.replaceAll('LucideIcons.$lucide', 'Icons.$material');
      });

      // Catch any remaining LucideIcons just in case
      content = content.replaceAll(RegExp(r'LucideIcons\.\w+'), 'Icons.star');

      file.writeAsStringSync(content);
      print('Updated ${file.path}');
    }
  }
}
