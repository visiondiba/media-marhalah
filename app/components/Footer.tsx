export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-ornament">
        <div className="footer-ornament-line"></div>
        <div className="footer-ornament-center">
          <div className="footer-diamond-sm"></div>
          <div className="footer-diamond"></div>
          <div className="footer-diamond-sm"></div>
        </div>
        <div className="footer-ornament-line"></div>
      </div>
      
      <div className="footer-logo">Panggung Gembira</div>
      <div className="footer-sub">The Absolute Spectacle</div>
      
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} Impervious Generation - Panggung Gembira. All rights reserved.
      </div>
    </footer>
  );
}
