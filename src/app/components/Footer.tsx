const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center pt-10 pb-5">
      <p className="text-sm text-foreground/50">
        &copy; {new Date().getFullYear()} - Todos os direitos reservados
      </p>
    </footer>
  );
};

export default Footer;
