import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { database } from '../database';

// Initialize Passport
export function initializeOAuth() {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/oauth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('google', profile, accessToken, refreshToken);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/oauth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('github', profile, accessToken, refreshToken);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // LinkedIn OAuth Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "/api/auth/oauth/linkedin/callback",
      scope: ['r_emailaddress', 'r_liteprofile']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('linkedin', profile, accessToken, refreshToken);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/api/auth/oauth/facebook/callback",
      profileFields: ['id', 'emails', 'name']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('facebook', profile, accessToken, refreshToken);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const stmt = database.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

async function handleOAuthCallback(
  provider: string, 
  profile: any, 
  accessToken: string, 
  refreshToken?: string
) {
  const email = profile.emails?.[0]?.value;
  const providerId = profile.id;
  
  if (!email) {
    throw new Error('Email not provided by OAuth provider');
  }

  // Check if OAuth provider entry exists
  const oauthStmt = database.prepare('SELECT * FROM oauth_providers WHERE provider = ? AND provider_id = ?');
  let oauthEntry = oauthStmt.get(provider, providerId);

  let user;
  
  if (oauthEntry) {
    // Existing OAuth user - get user record
    const userStmt = database.prepare('SELECT * FROM users WHERE id = ?');
    user = userStmt.get(oauthEntry.user_id);
    
    // Update tokens
    const updateOAuthStmt = database.prepare(`
      UPDATE oauth_providers 
      SET access_token = ?, refresh_token = ?, expires_at = ?
      WHERE id = ?
    `);
    updateOAuthStmt.run(
      accessToken,
      refreshToken || null,
      new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      oauthEntry.id
    );
  } else {
    // Check if user exists with this email
    const userStmt = database.prepare('SELECT * FROM users WHERE email = ?');
    user = userStmt.get(email);
    
    if (!user) {
      // Create new user
      const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
      const lastName = profile.name?.familyName || profile.displayName?.split(' ')[1] || '';
      
      const insertUserStmt = database.prepare(`
        INSERT INTO users (id, email, first_name, last_name, avatar_url, email_verified)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertUserStmt.run(
        userId,
        email,
        firstName,
        lastName,
        profile.photos?.[0]?.value || null,
        1 // OAuth emails are considered verified
      );
      
      // Create user preferences
      const insertPreferencesStmt = database.prepare(`
        INSERT INTO user_preferences (user_id) VALUES (?)
      `);
      insertPreferencesStmt.run(userId);
      
      user = { id: userId, email, first_name: firstName, last_name: lastName };
    }
    
    // Create OAuth provider entry
    const oauthId = 'oauth-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const insertOAuthStmt = database.prepare(`
      INSERT INTO oauth_providers (id, user_id, provider, provider_id, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertOAuthStmt.run(
      oauthId,
      user.id,
      provider,
      providerId,
      accessToken,
      refreshToken || null,
      new Date(Date.now() + 3600000).toISOString()
    );
  }
  
  return user;
} 