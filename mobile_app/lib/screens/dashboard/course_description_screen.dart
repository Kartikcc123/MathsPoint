import 'package:flutter/material.dart';
import '../../core/services/cart_manager.dart';

class CourseDescriptionScreen extends StatelessWidget {
  final Map<String, dynamic> course;

  const CourseDescriptionScreen({super.key, required this.course});

  @override
  Widget build(BuildContext context) {
    final title = course['title'] ?? 'Course Details';
    final feeAmount = course['feeAmount'] != null ? course['feeAmount'].toString() : '0';
    final mrp = course['mrp'] != null ? course['mrp'].toString() : '0';
    final description = course['description'] ?? 'No description available for this course.';

    // Calculate discount
    String discountText = '';
    double feeValue = double.tryParse(feeAmount) ?? 0;
    double mrpValue = double.tryParse(mrp) ?? 0;
    if (mrpValue > 0 && mrpValue > feeValue) {
      int discountPercent = ((mrpValue - feeValue) / mrpValue * 100).round();
      discountText = '$discountPercent% OFF';
    }

    return DefaultTabController(
      length: 1,
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F7FA),
        body: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              // Gradient App Bar
              SliverAppBar(
                expandedHeight: 160,
                floating: false,
                pinned: true,
                backgroundColor: const Color(0xFF3284FF),
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF3284FF), Color(0xFF1E40AF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(56, 8, 56, 56),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                letterSpacing: -0.3,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                actions: [
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Text('XP', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white70, fontSize: 12)),
                        SizedBox(width: 4),
                        Text('0', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.notifications_none_rounded, color: Colors.white),
                    onPressed: () {},
                  ),
                ],
                bottom: const TabBar(
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  padding: EdgeInsets.zero,
                  labelPadding: EdgeInsets.symmetric(horizontal: 20),
                  labelColor: Colors.white,
                  unselectedLabelColor: Colors.white60,
                  indicatorColor: Colors.white,
                  indicatorWeight: 3,
                  labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
                  tabs: [
                    Tab(text: 'Description'),
                  ],
                ),
              ),
            ];
          },
          body: TabBarView(
            children: [
              _buildDescriptionTab(context, description, title),
            ],
          ),
        ),
        bottomNavigationBar: _buildBottomBar(context, feeAmount, mrp, discountText),
      ),
    );
  }

  Widget _buildDescriptionTab(BuildContext context, String description, String title) {
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
        Color? iconColor;
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
              padding: const EdgeInsets.only(bottom: 4.0),
              child: _buildFeatureRow(iconData, iconColor!, line),
            ),
          );
        } else {
          featureWidgets.add(
            Padding(
              padding: const EdgeInsets.only(left: 44.0, bottom: 4.0),
              child: Text(
                line,
                style: TextStyle(fontSize: 14, color: Colors.grey.shade700, height: 1.5),
              ),
            ),
          );
        }
      }
    } else {
      featureWidgets.add(
        Text(
          featuresText,
          style: const TextStyle(fontSize: 15, color: Color(0xFF374151), height: 1.6),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // "This Batch Includes" card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 12,
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
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF3284FF).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.checklist_rounded, size: 20, color: Color(0xFF3284FF)),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'This Batch Includes',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                ...featureWidgets,
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (parsedFaqs.isNotEmpty) ...[
            const SizedBox(height: 24),
            // FAQ Section
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 12,
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
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.quiz_rounded, size: 20, color: Color(0xFFF59E0B)),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        "FAQ's",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ...parsedFaqs.asMap().entries.map((entry) {
                    final faq = entry.value;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: Material(
                        color: const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(14),
                        child: Theme(
                          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                          child: ExpansionTile(
                          tilePadding: const EdgeInsets.symmetric(horizontal: 16),
                          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          collapsedShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          title: Text(
                            faq['q']!,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: Color(0xFF374151),
                            ),
                          ),
                          expandedCrossAxisAlignment: CrossAxisAlignment.start,
                          expandedAlignment: Alignment.centerLeft,
                          children: [
                            Text(
                              faq['a']!,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(IconData icon, Color color, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                text,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF374151),
                  height: 1.4,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, String fee, String mrp, String discountText) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            offset: const Offset(0, -4),
            blurRadius: 12,
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              flex: 1,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '₹$fee',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (mrp != '0' && mrp != fee)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 2),
                          child: Text(
                            '₹$mrp',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey.shade400,
                              decoration: TextDecoration.lineThrough,
                              decorationColor: Colors.grey.shade400,
                            ),
                          ),
                        ),
                    ],
                  ),
                  if (discountText.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.local_offer_rounded, size: 12, color: Color(0xFF059669)),
                          const SizedBox(width: 4),
                          Text(
                            discountText,
                            style: const TextStyle(
                              color: Color(0xFF059669),
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              flex: 1,
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3284FF), Color(0xFF2563EB)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF3284FF).withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () {
                    CartManager().selectedCourse = course;
                    if (CartManager().switchTab != null) {
                      CartManager().switchTab!(2);
                    }
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text(
                    'BUY NOW',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
