import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';

class TestSeriesScreen extends StatefulWidget {
  const TestSeriesScreen({super.key});

  @override
  State<TestSeriesScreen> createState() => _TestSeriesScreenState();
}

class _TestSeriesScreenState extends State<TestSeriesScreen> {
  bool _isLoading = true;
  List<dynamic> _tests = [];

  @override
  void initState() {
    super.initState();
    _fetchTests();
  }

  Future<void> _fetchTests() async {
    try {
      final tests = await ApiService().getTestSeries();
      if (mounted) {
        setState(() {
          _tests = tests;
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
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_tests.isEmpty) {
      return _buildEmptyState();
    }

    // This section will render when there are actual tests.
    // Since the API returns empty for now, the empty state will show.
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('My Tests'),
      ),
      body: ListView.builder(
        itemCount: _tests.length,
        itemBuilder: (context, index) {
          final test = _tests[index];
          return ListTile(
            title: Text(test['title'] ?? 'Test'),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Top Gradient Header
          Container(
            height: 250,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFFCCFBF1), Color(0xFFFFEDD5)], // Light green to light orange
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Stack(
              children: [
                // Faint grid pattern (simplified with faint boxes)
                Positioned(
                  right: -50,
                  bottom: -50,
                  child: Opacity(
                    opacity: 0.1,
                    child: Icon(Icons.grid_view, size: 200, color: Colors.white),
                  ),
                ),
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Back button removed because it's a tab
                            const SizedBox(width: 24),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Row(
                                    children: [
                                      Text('XP', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue, fontSize: 12)),
                                      SizedBox(width: 4),
                                      Text('0', style: TextStyle(fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                const Icon(Icons.bookmark_border, color: Colors.black87),
                                const SizedBox(width: 16),
                                const Icon(Icons.notifications_none, color: Colors.black87),
                              ],
                            ),
                          ],
                        ),
                        const Spacer(),
                        const Text(
                          'My Tests',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Bottom Empty Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Custom illustration (Document + Magnifying Glass)
                  SizedBox(
                    height: 120,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Icon(Icons.description, size: 100, color: Colors.blue.shade100),
                        Positioned(
                          right: 10,
                          bottom: 10,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(Icons.search, size: 40, color: Colors.deepOrange),
                          ),
                        ),
                        const Positioned(
                          right: 22,
                          bottom: 22,
                          child: Text('?', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.deepOrange)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'No Test Available',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  // const SizedBox(height: 12),
                  // const Text(
                  //   // 'Your purchased Test Pass will appear here. Start your prep by choosing one!',
                  //   textAlign: TextAlign.center,
                  //   style: TextStyle(
                  //     fontSize: 14,
                  //     color: Color(0xFF4B5563),
                  //     height: 1.5,
                  //   ),
                  // ),
                  // const SizedBox(height: 32),
                  // ElevatedButton(
                  //   onPressed: () {},
                  //   style: ElevatedButton.styleFrom(
                  //     backgroundColor: const Color(0xFF1F2937),
                  //     foregroundColor: Colors.white,
                  //     padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  //     shape: RoundedRectangleBorder(
                  //       borderRadius: BorderRadius.circular(8),
                  //     ),
                  //   ),
                  //   child: const Text(
                  //     'Explore Test Pass',
                  //     style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  //   ),
                  // ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
