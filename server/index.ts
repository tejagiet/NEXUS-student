import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Supabase admin client for backend
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("CRITICAL: Supabase credentials missing from Environment. Ensure .env is loaded.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get formatted date
const getTodayString = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return `Good Evening, ${new Date().toLocaleDateString('en-US', options)}`;
};

// Routes
app.get('/api/feeds', async (req, res) => {
  try {
    // New institutional schema: 'notices' and 'academic_calendar' can represent feeds
    const { data: notices, error } = await supabase
        .from('notices')
        .select(`
            *,
            author:author_id (full_name, avatar_url, role)
        `)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert 'notices' to the "FeedItem" format expected by the frontend
    const feeds = notices.map(n => ({
        id: n.id,
        author: n.author?.full_name || 'System Notice',
        avatar: n.author?.full_name ? n.author.full_name[0] : 'N',
        timestamp: new Date(n.created_at).toLocaleString(),
        title: n.title,
        content: n.content,
        image: n.attachment_url,
        likes: 0, // Placeholder as schema doesn't have likes yet
        comments: 0,
        type: n.target_role === 'ALL' ? 'feed' : 'announcement'
    }));
    
    return res.json(feeds);
  } catch (err: any) {
    console.error("Database error (Feeds):", err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // 0. Validation: Ensure both fields are provided
    if (!identifier || !password) {
      return res.status(400).json({ error: "Scholar ID/Email and Password are required." });
    }

    let email = identifier;

    // 1. PIN Resolution: if not an email format, search profiles for the PIN
    if (!identifier.includes('@')) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('pin_number', identifier)
        .single();
      
      if (error || !profile) {
        return res.status(401).json({ error: "Invalid Scholar ID or PIN" });
      }
      email = profile.email;
    }

    // 2. Supabase Auth: Sign in with password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: authError?.message || "Authentication failed" });
    }

    // 3. Fetch full profile data to return to the frontend
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('pin_number, full_name, role')
      .eq('id', authData.user.id)
      .single();

    if (pError || !profile) {
      // If auth succeeds but no profile exists, still allow session but notify frontend
      return res.json({ 
        success: true, 
        session: authData.session,
        user: { pin_number: identifier.includes('@') ? 'GUEST' : identifier, full_name: 'Authenticated User', role: 'student' },
        session_pin: identifier.includes('@') ? 'GUEST' : identifier
      });
    }

    return res.json({ 
      success: true, 
      session: authData.session,
      user: profile,
      session_pin: profile.pin_number 
    });
  } catch (err: any) {
    console.error("CRITICAL LOGIN ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error: " + err.message });
  }
});

// ==============================================
// 2. DASHBOARD: HOME HUB DATA
// ==============================================
app.get('/api/home', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    
    // Fetch individual profile and its related stats
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, branch, section')
      .eq('pin_number', PIN)
      .single();

    if (pError) throw pError;

    // Fetch Fee Summary (Total Dues = College + Transport + Year-wise)
    const { data: fees } = await supabase
      .from('fees')
      .select('college_due, transport_due, total_fee, status')
      .eq('student_id', profile.id)
      .single();

    // Fetch Attendance summary (Topics & Counts)
    const { data: attRecords } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', profile.id);

    const total = attRecords?.length || 0;
    const present = attRecords?.filter(r => r.status === 'present').length || 0;
    const attPercentage = total > 0 ? ((present / total) * 100).toFixed(2) : "100.00";

    // Fetch Latest Notices
    const { data: notices } = await supabase
      .from('notices')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(2);

    return res.json({
      studentName: profile.full_name,
      currentDate: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
      attendance: `${attPercentage} %`,
      feesDue: fees ? `Dues INR ${(Number(fees.college_due) + Number(fees.transport_due)).toLocaleString('en-IN')}` : "No Dues",
      upcomingEvents: "4 Upcoming",
      campusClubs: "Join Activity",
      libraryPick: {
        title: "Quantum Mechanics II",
        status: "Ready to borrow from Central Wing",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcb1YOTj9y23S69XYuM-K1QA7V6KGIMBvCaZ5U_Tl0FexMvVgEB3s08FHpZBxZbPnjGLUUTeF_51SJw722hBXGnwJi6BWpDKdd0Makfih5u4_eGUyIkrVvD5BI3kMPMeKTVt4HiT_moaJm9KovWcxsIEXb1WMvMbkWYzHaWv5IEBpukQ199WoW8LN9Q2ryug7ai9nFVkjWbrO87u2Fqj1leEv6788hxC5EsgQNC7DAR90Z77U504byvfg0ePh9QRiBVGhSRlysfqY"
      },
      notices: notices?.map(n => ({
        id: n.id,
        title: n.title,
        date: new Date(n.created_at).toLocaleDateString(),
        urgent: true
      })) || []
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 3. ACADEMICS: ATTENDANCE & SUBJECTS
// ==============================================
app.get('/api/attendance', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    const { data: profile } = await supabase.from('profiles').select('id').eq('pin_number', PIN).single();
    
    // Aggregating attendance with topics based on Nexus Schema
    const { data, error } = await supabase
      .from('attendance')
      .select('*, subjects(name, code)')
      .eq('student_id', profile?.id);

    if (error) throw error;

    const subjectsMap: Record<string, any> = {};
    data?.forEach(record => {
      const sName = record.subjects.name;
      if (!subjectsMap[sName]) {
        subjectsMap[sName] = { name: sName, code: record.subjects.code, present: 0, total: 0, topics: [] };
      }
      subjectsMap[sName].total++;
      if (record.status === 'present') subjectsMap[sName].present++;
      if (record.topic) subjectsMap[sName].topics.push(record.topic);
    });

    const subjectsArray = Object.values(subjectsMap).map(s => ({
      ...s,
      percentage: ((s.present / s.total) * 100).toFixed(2),
      periods: `${s.present}/${s.total} Periods`
    }));

    return res.json(subjectsArray);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/subjects', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    const { data: profile } = await supabase.from('profiles').select('branch').eq('pin_number', PIN).single();
    
    // Filter subjects by branch and standard IV Semester text
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('branch', profile?.branch);

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 4. TIMETABLE: PERSONAL SCHEDULE
// ==============================================
app.get('/api/schedule', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    const { data: profile } = await supabase.from('profiles').select('branch, section').eq('pin_number', PIN).single();
    
    const { data, error } = await supabase
      .from('timetable_slots')
      .select('*, subjects(name, code, credits)')
      .eq('branch', profile?.branch)
      .eq('section', profile?.section)
      .order('slot', { ascending: true });

    if (error) throw error;
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 5. PROFILE: BIO & FINANCE DETAILS
// ==============================================
app.get('/api/profile', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, fees(*)')
      .eq('pin_number', PIN)
      .single();

    if (error) throw error;

    // Aggregating attendance global percentage
    const { data: att } = await supabase.from('attendance').select('status').eq('student_id', profile.id);
    const total = att?.length || 0;
    const present = att?.filter(r => r.status === 'present').length || 0;
    const attPercentage = total > 0 ? ((present / total) * 100).toFixed(2) : "100.00";

    // Normalize fees data for frontend stability
    const fees = profile.fees || {
      college_due: 0,
      transport_due: 0,
      year_1_due: 0,
      year_2_due: 0,
      year_3_due: 0,
      year_4_due: 0,
      status: 'PAID'
    };

    return res.json({ profile, stats: { fees, attPercentage } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 6. EXAMS/LMS: SUBMISSIONS & HISTORICAL DATA
// ==============================================
app.get('/api/exams/results', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    const { data: profile } = await supabase.from('profiles').select('id').eq('pin_number', PIN).single();
    
    // Mapping submissions/assignments for performance metrics
    const { data: results, error } = await supabase
      .from('submissions')
      .select('grade, feedback, submitted_at, assignments(title, max_points)')
      .eq('student_id', profile?.id);

    if (error) throw error;
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 7. MESSAGING & SOCIAL MODULES
// ==============================================
app.get('/api/chats', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    const { data: profile } = await supabase.from('profiles').select('id, branch, section').eq('pin_number', PIN).single();
    
    // Fetch channels for the student's branch and section
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('id, name')
      .eq('branch', profile?.branch)
      .eq('section', profile?.section);

    if (error) throw error;

    const roomsWithLastMsg = await Promise.all(rooms.map(async (p: any) => {
      const { data: lastMsg } = await supabase
        .from('chat_messages')
        .select('content, created_at')
        .eq('room_id', p.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      return {
        id: p.id,
        title: p.name,
        lastMessage: lastMsg?.content || "No messages yet",
        time: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleDateString() : 'N/A',
        initials: p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 3)
      };
    }));

    return res.json(roomsWithLastMsg);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chats/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, content, created_at, sender_id, profiles(full_name, role)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return res.json(messages);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { senderPin, content } = req.body;
    const { data: profile } = await supabase.from('profiles').select('id').eq('pin_number', senderPin).single();
    
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({ room_id: roomId, sender_id: profile?.id, content })
      .select('*, profiles(full_name, role)')
      .single();

    if (error) throw error;
    return res.json(newMessage);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 8. FEEDS & INSTITUTIONAL NEWS
// ==============================================
app.get('/api/feeds', async (req, res) => {
  try {
    // Nexus Institutional News (Notices)
    const { data: feedResults, error } = await supabase
      .from('notices')
      .select('*, profiles(full_name, role)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedFeeds = feedResults.map((post: any) => ({
      id: post.id,
      author: post.profiles?.full_name || "Nexus SOC",
      avatar: (post.profiles?.full_name || "N")[0],
      title: post.title,
      content: post.content,
      image: post.attachment_url, // Aligning with 'attachment_url' from nexus_full_sql_code.sql
      type: post.target_role === 'student' ? 'announcement' : 'feed',
      timestamp: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    return res.json(mappedFeeds);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 9. NOTIFICATIONS: ALERTS & RECENT ACTIVITY
// ==============================================
app.get('/api/notifications', async (req, res) => {
  try {
    const PIN = req.query.pin as string;
    const { data: profile } = await supabase.from('profiles').select('id, branch, role').eq('pin_number', PIN).single();
    
    // 1. Fetch Official Notices (Announcements)
    const { data: notices } = await supabase
      .from('notices')
      .select('*')
      .limit(3)
      .order('created_at', { ascending: false });

    // 2. Fetch Attendance for Alerts
    const { data: att } = await supabase.from('attendance').select('*, subjects(name)').eq('student_id', profile?.id);
    const subjectsMap: Record<string, any> = {};
    att?.forEach(record => {
      const sName = record.subjects.name;
      if (!subjectsMap[sName]) subjectsMap[sName] = { present: 0, total: 0 };
      subjectsMap[sName].total++;
      if (record.status === 'present') subjectsMap[sName].present++;
    });

    // 3. Aggregate into notifications format from notifications.html
    const notifications = [];

    // Add Notices
    notices?.forEach(n => {
      notifications.push({
        id: n.id,
        title: n.title,
        content: n.content,
        type: 'announcement',
        timestamp: new Date(n.created_at).toLocaleString(),
        icon: 'campaign'
      });
    });

    // Add Attendance Alerts
    Object.entries(subjectsMap).forEach(([name, stats]: [string, any]) => {
      const per = (stats.present / stats.total) * 100;
      if (per < 75) {
        notifications.push({
          id: `att-${name}`,
          title: 'Attendance Alert 🚨',
          content: `Your attendance in ${name} has fallen to ${per.toFixed(1)}%. Please attend the next session.`,
          type: 'alert',
          timestamp: 'Just now',
          icon: 'warning'
        });
      }
    });

    // Add Payment Status (Mocked based on schema)
    const { data: fees } = await supabase.from('fees').select('status, college_due').eq('student_id', profile?.id).single();
    if (fees && fees.college_due === 0) {
      notifications.push({
        id: 'fee-success',
        title: 'Payment Successful ✅',
        content: `Your institutional fee payment status is now: ${fees.status}. Transaction verified.`,
        type: 'success',
        timestamp: 'Recent',
        icon: 'check_circle'
      });
    }

    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================
// 10. SBTET RESULTS: PORTAL PROXY
// ==============================================
app.get('/api/results', async (req, res) => {
  try {
    const { pin, semester } = req.query;
    
    // Institutional Demo: If the specific PIN is searched, return the verified SBTET result
    if (pin === '24295-AI-038' || pin === 'DEMO') {
      return res.json({
        success: true,
        data: {
          studentName: 'MOLLETI TEJA YESWANTH VEERA MANIKANTA',
          branch: 'DIPLOMA IN ARTIFICIAL INTELLIGENCE',
          gpa: 7.64, 
          grandTotal: 687, 
          result: 'PASS',
          examMonth: 'OCT/NOV 2025', 
          semester: semester === '3' ? '3rd Semester' : `${semester} Semester`,
          subjects: [
            { code: '301', external: 37, internal: 19, total: 56, gradePoints: 6,  credits: 2.5, grade: 'C+', result: 'PASS' },
            { code: '302', external: 46, internal: 19, total: 65, gradePoints: 7,  credits: 2.5, grade: 'B',  result: 'PASS' },
            { code: '303', external: 42, internal: 19, total: 61, gradePoints: 7,  credits: 2.5, grade: 'B',  result: 'PASS' },
            { code: '304', external: 48, internal: 13, total: 61, gradePoints: 7,  credits: 3.0, grade: 'B',  result: 'PASS' },
            { code: '305', external: 38, internal: 19, total: 57, gradePoints: 6,  credits: 3.0, grade: 'C+', result: 'PASS' },
            { code: '306', external: 58, internal: 40, total: 98, gradePoints: 10, credits: 2.0, grade: 'A+', result: 'PASS' },
            { code: '307', external: 56, internal: 39, total: 95, gradePoints: 10, credits: 1.0, grade: 'A+', result: 'PASS' },
            { code: '308', external: 58, internal: 39, total: 97, gradePoints: 10, credits: 1.5, grade: 'A+', result: 'PASS' },
            { code: '309', external: 58, internal: 39, total: 97, gradePoints: 10, credits: 1.5, grade: 'A+', result: 'PASS' },
          ]
        }
      });
    }

    // Generic fallback for others (simulating no result found on portal)
    return res.status(404).json({ error: "No results found on the SBTET portal for this PIN/Semester combination." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nexus GIET Unified Framework - Institutional Expansion (Sidebar, Schedule, Notifications) active.' });
});

app.listen(port, () => {
  console.log(`Nexus Backend listening at http://localhost:${port}`);
});
