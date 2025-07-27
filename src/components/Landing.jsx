import React, { useEffect } from 'react';

export default function Landing() {
  useEffect(() => {
    if (window.AOS) {
      window.AOS.init();
    }
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}

const html = `
  <header id="header" class="header d-flex align-items-center sticky-top">
    <div class="container-fluid container-xl position-relative d-flex align-items-center">

      <a href="index.html" class="logo d-flex align-items-center me-auto">
            <img src="assets/img/2.png" class="img-fluid logo" alt="Sistema de Turnos">
      </a>

      <nav id="navmenu" class="navmenu">
        <ul>
          <li><a href="#hero" class="active">Inicio</a></li>
          <li><a href="#services">Ventajas</a></li>
          <li><a href="#portfolio">Más Info</a></li>
          <li><a href="#contact">Contacto</a></li>
        </ul>
        <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

      <a class="btn-getstarted" href="#about">Ingreso Clientes</a>

    </div>
  </header>

  <main class="main">

    <!-- Hero Section -->
    <section id="hero" class="hero section">

      <div class="container">
        <div class="row gy-4">
          <div class="col-lg-8 order-2 order-lg-1 d-flex flex-column justify-content-center" data-aos="fade-up">
            <h2>Agendá tus turnos fácilmente</h2>
            <br>
            <p>• Gestioná citas, pagos y recordatorios desde un único panel de control. </p>
            <p>• Profesionalizá la atención a tus clientes con notificaciones automáticas por email.</p>
            <p>• Tus clientes podrán reservar los turnos a cualquier hora sin necesidad de que estés presente.</p>
            <p>• Te ayudamos a gestionar tu tiempo de trabajo de la mejor forma.</p>
            <br>
            <div class="d-flex">
              <a href="#about" class="btn-get-started">Descubrí más</a>
              <a href="#contact" class="btn-watch-video d-flex align-items-center ms-3"><i class="bi bi-whatsapp"></i><span>Contactar Ahora</span></a>
            </div>
          </div>
          <div class="col-lg-4 order-1 order-lg-2 hero-img" data-aos="zoom-out" data-aos-delay="100">
            <img src="assets/img/hero-img.png" class="img-fluid imgw animated w-80" alt="Sistema de Turnos">
          </div>
        </div>
      </div>

    </section><!-- /Hero Section -->


    <!-- Services Section -->
    <section id="services" class="services section light-background">

      <!-- Section Title -->
      <div class="container section-title" data-aos="fade-up">
        <span>Ventajas</span>
        <h2>Por qué elegirnos</h2>
      </div><!-- End Section Title -->

      <div class="container">

        <div class="row gy-4">

          <div class="col-lg-3 col-md-3" data-aos="fade-up" data-aos-delay="300">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-phone icon"></i></div>
              <h3>Fácil registro y control de clientes</h3>
              <p>Tus clientes se registran en sólo segundos, y en tu panel de turnos podrás comunicarte con ellos en sólo un click.</p>
            </div>
          </div><!-- End Service Item -->



          <div class="col-lg-3 col-md-3" data-aos="fade-up" data-aos-delay="500">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-people icon"></i></div>
              <h3>Multi Usuarios</h3>
              <p>Si tu negocio tiene más de un profesional disponible podrás gestionar todo desde un sólo panel.</p>
            </div>
          </div><!-- End Service Item -->

          <div class="col-lg-3 col-md-3" data-aos="fade-up" data-aos-delay="600">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-tools icon"></i></div>
              <h3>Cofigurable</h3>
              <p>Días y horarios configurables. Edita el precio y duración de tus servicios en segundos.</p>
            </div>
          </div><!-- End Service Item -->

          <div class="col-lg-3 col-md-3" data-aos="fade-up" data-aos-delay="400">
            <div class="service-item position-relative">
              <div class="icon"><i class="bi bi-headset icon"></i></div>
              <h3>Soporte Personalizado</h3>
              <p>Atención directa por chat, email o WhatsApp para resolver consultas o recibir ayuda en las configuraciones.</p>
            </div>
          </div><!-- End Service Item -->
        </div>

      </div>

    </section><!-- /Services Section -->

<section id="portfolio-details" class="portfolio-details section">

      <div class="container aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
<h2 class="text-center mb-5">PLANES DISPONIBLES</h2>
        <div class="row gy-4">
                

          <div class="col-lg-4">
            <div class="portfolio-info aos-init aos-animate" data-aos="fade-up" data-aos-delay="200">
              <h3 class="text-center">Plan Base</h3>
              <h6 class="text-center">Ideal para emprendedores</h6>
              <br>
              <ul>
                <li><strong>Profesionales</strong>: Hasta Dos.</li>
                <li><strong>Turnos</strong>: Sin límite.</li>
                <li><strong>Servicios</strong>: Configurables e Ilimitados.</li>
                <li><strong>Enlace</strong>: <a href="#">agendarturnos.ar/tunegocio</a></li>
                <br><br>
                <h5 class="text-center"><b>Precio</b>: $9.000 / mes</h5>
                <a href="#about" class="btn-get-started mt-4 text-center d-block">Solicitar</a>
              </ul>
            </div>
          </div>                

         <div class="col-lg-4">
            <div class="portfolio-info aos-init aos-animate" data-aos="fade-up" data-aos-delay="200">
              <h3 class="text-center">Plan Premium</h3>
              <h6 class="text-center">Ideal para negocios</h6>
              <br>
              <ul>
                <li><strong>Profesionales</strong>: Ilimitado.</li>
                <li><strong>Turnos</strong>: Sin límite.</li>
                <li><strong>Servicios</strong>: Configurables e Ilimitados.</li>
                <li><strong>Enlace</strong>: <a href="#">agendarturnos.ar/tunegocio</a></li>
                <br><br>
                <h5 class="text-center"><b>Precio</b>: $18.000 / mes</h5>
                <a href="#about" class="btn-get-started mt-4 text-center d-block">Solicitar</a>
              </ul>
            </div>
          </div>                

          <div class="col-lg-4">
            <div class="portfolio-info aos-init aos-animate" data-aos="fade-up" data-aos-delay="200">
              <h3 class="text-center">Personalizado</h3>
              <h6 class="text-center">Ideal para canchas deportivas</h6>
              <br>
              <ul>
                <li><strong>Canchas</strong>: Ilimitado.</li>
                <li><strong>Turnos</strong>: Sin límite.</li>
                <li><strong>Imagen</strong>: Logo y colores propios.</li>
                <li><strong>Enlace</strong>: <a href="#">agendarturnos.ar/tunegocio</a></li>
                <br><br>
                <h5 class="text-center"><b>Precio</b>: $27.000 / mes</h5>
              <a href="#about" class="btn-get-started mt-4 text-center d-block">Solicitar</a>
              </ul>
            </div>
          </div>  

        </div>

      </div>

    </section>

    <!-- Call To Action Section -->
    <section id="call-to-action" class="call-to-action section accent-background">

      <div class="container">
        <div class="row justify-content-center" data-aos="zoom-in" data-aos-delay="100">
          <div class="col-xl-10 text-center">
            <h3>Listo para optimizar tu gestión de turnos?</h3>
            <p>Contactanos y comenzá tu prueba gratuita hoy mismo. Sin límites de turnos durante el primer mes.</p>
            <a class="cta-btn" href="#contact">Contáctanos</a>
          </div>
        </div>
      </div>

    </section><!-- /Call To Action Section -->





  </main>

  <footer id="footer" class="footer">

    <div class="container footer-top">
      <div class="row gy-4">



        <div class="col-lg-8 col-md-6 footer-about">
          <a href="index.html" class="d-flex align-items-center">
            <span class="sitename">Agendar Turnos</span>
          </a>
          <p>Servicio de software para gestión y automatización de turnos, pagos y recordatorios.</p>

          
          <div class="social-links d-flex mt-3">
            <a href="#" class="bi bi-instagram"></a><a href=""><h4 class="mt-2 mx-2">Agendar.turnos</h4></a>
          </div>
        </div>
        <div class="col-lg-4 col-md-12 text-center text-md-start">
          <h4>Contáctanos</h4>
          <p>
            Necochea, Buenos Aires<br>
            Argentina<br><br>
            +54 2299 123-456<br>
            agendarturnosonline@gmail.com.ar<br>
          </p>
        </div>

      </div>
    </div>

    <div class="container copyright text-center mt-4">
      <p>© <strong>Agendar Turnos</strong>. Todos los derechos reservados.</p>
    </div>

  </footer>

  <!-- Scroll Top -->
  <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>

`;
