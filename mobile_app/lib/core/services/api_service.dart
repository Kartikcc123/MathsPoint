import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // If running on Android emulator, you might need to change localhost to 10.0.2.2
  static const String baseUrl = 'https://mathspoint-yqnv.onrender.com/api';
  static String? authToken;

  final Dio _dio = Dio(BaseOptions(baseUrl: baseUrl))..interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        if (authToken != null) {
          options.headers['Authorization'] = 'Bearer $authToken';
        }
        return handler.next(options);
      },
    ),
  );

  /// Load saved token from persistent storage (call once at app startup)
  static Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    authToken = prefs.getString('auth_token');
  }

  /// Save token to persistent storage
  static Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  /// Clear token (for logout)
  static Future<void> clearToken() async {
    authToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<Map<String, dynamic>> getHomeContent() async {
    try {
      final response = await _dio.get('/public/home-content');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to load home content: ${(e.response?.data is Map ? e.response?.data['message'] : null) ?? e.message}');
    } catch (e) {
      throw Exception('Failed to load home content: $e');
    }
  }

  Future<Map<String, dynamic>> getStudentDashboard() async {
    try {
      final response = await _dio.get('/student/dashboard');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to load dashboard: ${(e.response?.data is Map ? e.response?.data['message'] : null) ?? e.message}');
    } catch (e) {
      throw Exception('Failed to load dashboard: $e');
    }
  }

  Future<List<dynamic>> getAdvertisements() async {
    try {
      final response = await _dio.get('/advertisements/public');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to load ads: ${(e.response?.data is Map ? e.response?.data['message'] : null) ?? e.message}');
    } catch (e) {
      throw Exception('Failed to load ads: $e');
    }
  }

  Future<void> trackAdImpression(String id) async {
    try {
      await _dio.post('/advertisements/track/impression', data: {'id': id});
    } catch (_) {}
  }

  Future<void> trackAdClick(String id) async {
    try {
      await _dio.post('/advertisements/track/click', data: {'id': id});
    } catch (_) {}
  }


  Future<List<dynamic>> getPublicCourses() async {
    try {
      final response = await _dio.get('/public/courses');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to load courses: ${(e.response?.data is Map ? e.response?.data['message'] : null) ?? e.message}');
    } catch (e) {
      throw Exception('Failed to load courses: $e');
    }
  }

  Future<List<dynamic>> getPublicFreeStudyMaterials(String section) async {
    try {
      final response = await _dio.get('/public/free-study-materials', queryParameters: {'section': section});
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw Exception('Failed to load materials: ${(e.response?.data is Map ? e.response?.data['message'] : null) ?? e.message}');
    } catch (e) {
      throw Exception('Failed to load materials: $e');
    }
  }

  Future<bool> checkPhoneExists(String phone) async {
    try {
      final response = await _dio.post('/auth/check-phone', data: {'phone': phone});
      return response.data['exists'] ?? false;
    } on DioException catch (e) {
      throw Exception('Failed to check phone: ${(e.response?.data is Map ? e.response?.data['message'] : null) ?? e.message}');
    } catch (e) {
      throw Exception('Failed to check phone: $e');
    }
  }

  Future<bool> checkEmailExists(String email) async {
    try {
      final response = await _dio.post('/auth/check-email', data: {'email': email});
      return response.data['exists'] ?? false;
    } on DioException catch (e) {
      throw Exception('Failed to check email: ${(e.response?.data is Map ? e.response?.data['message'] : null) ?? e.message}');
    } catch (e) {
      throw Exception('Failed to check email: $e');
    }
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/auth/profile', data: data);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Failed to update profile');
    } catch (e) {
      throw Exception('Failed to update profile: $e');
    }
  }

  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final response = await _dio.get('/auth/profile');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Failed to get profile');
    } catch (e) {
      throw Exception('Failed to get profile: $e');
    }
  }

  Future<Map<String, dynamic>> login(String identifier, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': identifier,
        'password': password
      });
      if (response.data['token'] != null) {
        authToken = response.data['token'];
        await _saveToken(response.data['token']);
      }
      return response.data;
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Login failed');
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }

  // Payment APIs
  Future<Map<String, dynamic>> createRazorpayOrder(String courseId) async {
    try {
      final response = await _dio.post('/payments/create-order', data: {
        'courseId': courseId,
      });
      return response.data;
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Failed to create order');
    }
  }

  Future<Map<String, dynamic>> verifyRazorpayPayment(
    String orderId, 
    String paymentId, 
    String signature,
  ) async {
    try {
      final response = await _dio.post('/payments/verify-payment', data: {
        'razorpay_order_id': orderId,
        'razorpay_payment_id': paymentId,
        'razorpay_signature': signature,
      });
      return response.data;
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Payment verification failed');
    }
  }

  Future<Map<String, dynamic>> registerAppUser({
    required String name,
    required String email,
    required String phone,
    required String state,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/register-app', data: {
        'name': name,
        'email': email,
        'phone': phone,
        'state': state,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Registration failed');
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post('/auth/forgot-password', data: {'email': email});
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Failed to send reset email');
    } catch (e) {
      throw Exception('Failed to send reset email: $e');
    }
  }
  Future<List<dynamic>> getTestSeries() async {
    try {
      final response = await _dio.get('/student/tests');
      return response.data as List<dynamic>;
    } catch (e) {
      // If endpoint doesn't exist yet, just return empty list
      return [];
    }
  }

  Future<List<dynamic>> getStudentPurchases() async {
    try {
      final response = await _dio.get('/student/purchases');
      return response.data as List<dynamic>;
    } catch (e) {
      return [];
    }
  }

  // Materials
  Future<List<dynamic>> getStudentMaterials() async {
    try {
      final response = await _dio.get('/student/materials');
      return response.data as List<dynamic>;
    } catch (e) {
      return [];
    }
  }

  String getMaterialStreamUrl(String materialId) {
    return '$baseUrl/student/material/$materialId/stream?token=$authToken';
  }

  // Lessons
  Future<List<dynamic>> getCourseLessons(String courseId) async {
    try {
      final response = await _dio.get('/lessons/course/$courseId');
      return response.data as List<dynamic>;
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>> getLessonPlayer(String lessonId) async {
    try {
      final response = await _dio.get('/lesson/$lessonId');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to fetch lesson player: $e');
    }
  }

  // Comments
  Future<List<dynamic>> getComments(String materialId) async {
    try {
      final response = await _dio.get('/student/material/$materialId/comments');
      return response.data as List<dynamic>;
    } catch (e) {
      return [];
    }
  }

  Future<Map<String, dynamic>> addComment(String materialId, String text) async {
    try {
      final response = await _dio.post('/student/material/$materialId/comment', data: {'text': text});
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw Exception((e.response?.data is Map ? e.response?.data['message'] : null) ?? 'Failed to add comment');
    } catch (e) {
      throw Exception('Failed to add comment: $e');
    }
  }

  Future<void> toggleLikeComment(String commentId) async {
    try {
      await _dio.post('/student/comment/$commentId/like');
    } catch (e) {
      print('Failed to like comment: $e');
    }
  }

  Future<void> reportComment(String commentId) async {
    try {
      await _dio.post('/student/comment/$commentId/report');
    } catch (e) {
      print('Failed to report comment: $e');
    }
  }
}
