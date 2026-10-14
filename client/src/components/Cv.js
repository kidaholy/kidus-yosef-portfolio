import { useEffect } from 'react';

const Cv = () => {
  useEffect(() => {
    document.title = 'CV · Kidus Yosef';
    return () => {
      document.title = 'Kidus Yosef';
    };
  }, []);

  return (
    <div className="cv-page">
      <div className="cv-head">
        <div>
          <span className="chip">CURRICULUM VITAE</span>
          <h1 className="title" style={{ marginTop: 12 }}>
            Kidus Yosef — CV
          </h1>
        </div>
        <div className="cv-actions">
          <a className="btn-p" href="/kidus-yosef-cv.pdf" download="Kidus-Yosef-CV.pdf">
            ⬇ Download PDF
          </a>
          <a className="btn-g" href="/kidus-yosef-cv.pdf" target="_blank" rel="noreferrer">
            Open in new tab ↗
          </a>
        </div>
      </div>

      <div className="cv-frame-wrap">
        <iframe
          className="cv-frame"
          src="/kidus-yosef-cv.pdf#view=FitH"
          title="Kidus Yosef — CV"
        />
      </div>

      <div className="cv-fallback">
        <p>
          If the document doesn&apos;t display on your device,{' '}
          <a href="/kidus-yosef-cv.pdf" download="Kidus-Yosef-CV.pdf">
            download the PDF
          </a>{' '}
          directly.
        </p>
      </div>
    </div>
  );
};

export default Cv;
