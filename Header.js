function Header() {
  return (
    <header>
      <img src="/growreal_logo.png" alt="Grow Real AI Logo" className="logo" />
      <nav>
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/blogs">Blogs</a>
        <a href="/community">Community</a>
        <a href="/login">Login</a>
        <a href="/register" className="btn">Register</a>
      </nav>
      <div className="social">
        <a href="https://instagram.com/growreal_365" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://youtube.com/@growreal-p9r" target="_blank" rel="noreferrer">YouTube</a>
      </div>
    </header>
  );
}
export default Header;
