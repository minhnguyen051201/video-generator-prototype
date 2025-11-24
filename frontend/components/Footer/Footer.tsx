const Footer = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4 justify-center">
        <aside>
          <p>
            Copyright © {new Date().getFullYear()} - All right reserved by AI
          </p>
        </aside>
      </footer>
    </div>
  );
};

export default Footer;
