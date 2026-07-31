import 'package:flutter/material.dart';


class DoubtSolvingScreen extends StatelessWidget {
  const DoubtSolvingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Doubt Solving'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Color(0xFF1F2937)),
            onPressed: () {},
          ),
        ],
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            const TabBar(
              labelColor: Color(0xFF4169E1),
              unselectedLabelColor: Colors.grey,
              indicatorColor: Color(0xFF4169E1),
              tabs: [
                Tab(text: 'Ask Doubt'),
                Tab(text: 'My Doubts'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildAskDoubtForm(context),
                  const Center(child: Text('My Doubts List')),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAskDoubtForm(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            maxLines: 4,
            decoration: InputDecoration(
              hintText: 'Write your doubt here...',
              hintStyle: TextStyle(color: Colors.grey[400]),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Theme.of(context).primaryColor),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.image_outlined, size: 20, color: Colors.grey),
              const SizedBox(width: 8),
              Text('Add Image (Optional)', style: TextStyle(color: Colors.grey[600])),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.add, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          DropdownButtonFormField<String>(
            decoration: InputDecoration(
              hintText: 'Select Subject',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            items: const [
              DropdownMenuItem(value: 'Maths', child: Text('Maths')),
              DropdownMenuItem(value: 'Physics', child: Text('Physics')),
            ],
            onChanged: (val) {},
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {},
              child: const Text('Submit Doubt', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Recent Doubts',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          _buildDoubtItem('How to find nature of roots?', 'Algebra • Quadratic Equations', '3h ago', 'Answered', Colors.green),
          _buildDoubtItem('Why discriminant is b^2-4ac?', 'Algebra • Quadratic Equations', '5h ago', 'Answered', Colors.green),
          _buildDoubtItem('Concept of Continuity', 'Calculus • Limits', '1d ago', 'Pending', Colors.orange),
        ],
      ),
    );
  }

  Widget _buildDoubtItem(String question, String topic, String time, String status, Color statusColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(question, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
                Text(topic, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(time, style: TextStyle(color: Colors.grey[500], fontSize: 12)),
              const SizedBox(height: 4),
              Text(status, style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          )
        ],
      ),
    );
  }
}
