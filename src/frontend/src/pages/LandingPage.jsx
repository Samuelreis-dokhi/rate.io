import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import '../pages/styles/LandingPage.css'
import divisao from '../public/images/divisoes.png';
import saldo from '../public/images/saldo.png';
import historico from '../public/images/historico.png';

const LandingPage = () => {
  const { isAuthenticated } = useAuth()
  const actionRoute = isAuthenticated ? '/dashboard' : '/auth'
  const [activeSlide, setActiveSlide] = useState(0)
  const actionLabel = isAuthenticated ? 'Acessar painel' : 'Começar agora'

  const slides = [
    {
      title: '3 modos de divisão',
      description: 'Igual, porcentagem ou valor exato',
      imageSource: divisao,
    },
    {
      title: 'Saldos em tempo real',
      description: 'Por usuário e por grupo',
      imageSource: saldo,
    },
    {
      title: 'Histórico transparente',
      description: 'Tudo registrado e fácil de revisar',
      imageSource: historico,
    },
  ]

  /* Função para automatizar a navegação entre os slides */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 4200)
    return () => clearInterval(interval)
  }, [slides.length])

  /* Função para navegar entre os slides */
  const goToSlide = (index) => {
    setActiveSlide(index)
  }

  return (
    <div className='landing-page'>
      <div className='bg-shape bg-shape-top' aria-hidden='true' />
      <div className='bg-shape bg-shape-bottom' aria-hidden='true' />

      {/* TOP MENU - VALIDAR SUA IMPLEMENTAÇÃO COM O GRUPO */}
      <header className='topbar'>
        <div className='brand'>RATE.IO</div>
        <nav>
          <a href='#como-funciona'>Como funciona</a>
          <Link to={actionRoute} className='btn btn-small btn-outline'>
            {actionLabel}
          </Link>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className='hero content-wrap'>
          {/* HERO COPY - TEXTO DE APRESENTAÇÃO DA IDEIA */}
          <div className='hero-copy'>
            <p className='kicker'>Despesas compartilhadas. <br /> Sem conversas difíceis sobre dinheiro</p>
            <h1>
              A forma mais simples de dividir gastos em grupo
            </h1>
            <p>
              Gerencie despesas em grupo de forma clara e automatizada. O Rate.io ajuda seu time a criar grupos, lançar gastos e acompanhar saldos reais.
            </p>
            {/* HERO ACTIONS - BOTÕES DE CALL TO ACTION */}
            <div className='hero-actions'>
              <Link to={actionRoute} className='btn btn-large btn-primary'>
                {actionLabel}
              </Link>
              <a href='#como-funciona' className='btn btn-ghost'>Ver como funciona</a>
            </div>
          </div>
        
          {/* HERO PANEL - INFORMAÇÕES DO GRUPO */}
          <aside className='hero-panel'>
            <div className='hero-panel-header'>
              <div>
                <p className='panel-tag'>Grupos ativos: 3</p>
                <strong>Valores a receber</strong>
              </div>
              <span className='hero-panel-value positive'>+R$ 200</span>
            </div>

            <div className='hero-panel-list'>
              <article className='hero-panel-item'>
                <div>
                  <strong>República PUC</strong>
                  <span>5 participantes</span>
                </div>
                <span className='hero-panel-value positive'>+R$ 350</span>
              </article>
              <article className='hero-panel-item'>
                <div>
                  <strong>Viagem Rio</strong>
                  <span>8 participantes</span>
                </div>
                <span className='hero-panel-value negative'>-R$ 150</span>
              </article>
              <article className='hero-panel-item'>
                <div>
                  <strong>Jantar Grupo</strong>
                  <span>4 participantes</span>
                </div>
                <span className='hero-panel-value neutral'>R$ 0</span>
              </article>
            </div>
          </aside>
          <div className='hero-banner-row'>
            {/* HERO BANNER - SLIDER DE INFORMAÇÕES */}
            <div className='hero-banner-slider'>
                {slides.map((item, index) => (
                    <article
                    key={item.title}
                    className={`banner-slide ${index === activeSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    >
                    <p className='metric-value'>{item.title}</p>
                    <p className='metric-label'>{item.description}</p>
                    <img src={item.imageSource} /> {/* Exibir a imagem associada ao slide */}
                    </article>
                ))}
            </div>
            
            
{/* BULLET POINTS PARA INTERACAO COM BANNER, DEVIDO A DIFICULDADES DE ESTILIZACAO, ESSE COMPONENTE FICARA COMENTADO
            <div className='hero-banner-dots'>
                {slides.map((_, index) => (
                    <button
                    key={index}
                    type='button'
                    className={`banner-dot ${index === activeSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
 */}
          </div>

        </section>

        {/* COMO FUNCIONA */}
        <section className='section content-wrap' id='como-funciona'>
          <div className='about-section'>
            <h2 className='section-title'>Como o Rateio funciona</h2>
            <p className='section-intro'>Mostramos o essencial primeiro e só revelamos o rateio avançado quando o grupo precisa dele.</p>
          </div>
          <div className='card-grid'>
            <article className='card'>
              <h3>1. Crie grupos</h3>
              <p>Adicione membros e organize despesas por contexto: república, viagem, evento.</p>
            </article>
            <article className='card'>
              <h3>2. Lance despesas</h3>
              <p>Registre gastos e escolha como dividir: igual, percentual ou valor exato.</p>
            </article>
            <article className='card'>
              <h3>3. Acerte as contas</h3>
              <p>Veja quem pagou, quem deve e finalize os acertos com clareza e transparência.</p>
            </article>
          </div>
        </section>

        {/* CALL TO ACTION FINAL */}
        <section className='section cta-band content-wrap'>
          <h2>Pronto para aposentar suas planilhas?</h2>
          <p>Organize suas finanças compartilhadas de forma simples e automática.</p>
          <Link to={actionRoute} className='btn btn-outline btn-primary'>
            {isAuthenticated ? 'Acessar painel' : 'Começar agora'}
          </Link>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
