    if (path[1] === 'login' && method === 'POST') {
      const body = await request.json();
      const rawEmail = body?.email;
      const rawPassword = body?.password;
      const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
      const password = typeof rawPassword === 'string' ? rawPassword : '';

      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return json({ error: 'Email y contraseña requeridos' }, 400);
      }

      const user = await db.collection('users').findOne({ email });
      if (!user || typeof user.password !== 'string' || !user.password) {
        return json({ error: 'Credenciales inválidas' }, 401);
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return json({ error: 'Credenciales inválidas' }, 401);

      const business = await db.collection('businesses').findOne({ id: user.businessId });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      const { password: _, ...userOut } = user;
      return json({ token, user: userOut, business });
    }
