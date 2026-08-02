import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import BlogFeed from '../components/BlogFeed';

function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <BlogFeed />
      <footer>
        <p>© 2026 SKILLRISE | Future in Present</p>
        <a href="/terms-user">User Terms</a> | 
        <a href="/terms-admin">Admin Terms</a>
      </footer>
    </>
  );
}
export default LandingPage;
