import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BlogFeed() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/blogs')
      .then(res => setBlogs(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="blogs">
      <h2>Latest Blogs</h2>
      {blogs.map(blog => (
        <div key={blog._id} className="blog-card">
          <h3>{blog.title}</h3>
          <p>{blog.content.substring(0, 150)}...</p>
          <button>Read More</button>
          <p>Likes: {blog.likes}</p>
        </div>
      ))}
    </section>
  );
}
export default BlogFeed;
