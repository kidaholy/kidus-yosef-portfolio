const Stats = ({ stats = [] }) => {
  if (!stats.length) return null;

  return (
    <section className="section" id="stats" style={{ paddingTop: 40 }}>
      <div className="stats-row reveal in">
        {stats.map(({ value, label, hot }) => (
          <div className={`stat${hot ? ' light' : ''}`} key={label}>
            <div className="value">{value}</div>
            <span className="label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
