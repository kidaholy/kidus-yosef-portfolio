const Blog = ({ posts = [] }) => {
  if (!posts.length) return null;

  return (
    <section className="section" id="blog">
      <div className="sec-head">
        <h2 className="title reveal">Latest Blog</h2>
        <p className="sub reveal">Notes from the field — architecture, design handoffs and shipping reliable software.</p>
      </div>
      <div className="blog-grid">
        {posts.map((post) => (
          <article className="blog-card reveal" key={post.title}>
            <img src={post.image || '/blog-a.svg'} alt="" />
            <div className="blog-body">
              <span className="date">{post.date}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Blog;
