
require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// اختبار أن الخادم يعمل
app.get('/', (req, res) => {
  res.json({
    message: 'AQDAR Backend is running'
  });
});

// التحقق من هوية المستخدم باستخدام Access Token
app.get('/api/me', async (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'يجب تسجيل الدخول أولًا'
    });
  }

  const token = authorization.slice(7);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      error: 'جلسة الدخول غير صالحة'
    });
  }

  return res.json({
    id: data.user.id,
    email: data.user.email
  });
});

const PORT = process.env.PORT || 3000;

const { createClient: createPublicClient } = require('@supabase/supabase-js');

const supabaseAuth = createPublicClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: 'أدخل البريد الإلكتروني وكلمة المرور'
    });
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error || !data.session) {
    return res.status(401).json({
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    });
  }

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });
});

app.listen(PORT, () => {
  console.log(`AQDAR Backend running on http://localhost:${PORT}`);
});
