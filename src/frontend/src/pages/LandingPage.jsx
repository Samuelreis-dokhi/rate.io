import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import MenuNav from "../components/MenuNav.jsx";

// Importamos o shared para herdar os padrões do sistema
import './styles/shared.css'
// Você ainda pode manter o LandingPage.css APENAS para o layout específico do Hero (lado a lado) e do Slider
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
    // Usa a casca do sistema real
    <div className='inner-page'>
      <div className='bg-shape bg-shape-top' aria-hidden='true' />
      <div className='bg-shape bg-shape-bottom' aria-hidden='true' />

      <MenuNav />
      
      <main className='inner-page-body'>
        {/* HERO SECTION */}
        <section className='hero content-wrap' style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', marginBottom: '80px' }}>
          
          {/* HERO COPY - Usando o padrão de page-header adaptado */}
          <div className='hero-copy' style={{ flex: '1 1 400px' }}>
            <p className='section-block__title-count' style={{ width: 'fit-content', marginBottom: '16px' }}>
              Sem conversas difíceis sobre dinheiro
            </p>
            <div className='page-header__text'>
              <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', lineHeight: 1.1, marginBottom: '16px' }}>
                A forma mais simples de dividir gastos em grupo
              </h1>
              <p style={{ fontSize: '1.1rem', marginBottom: '32px' }}>
                Gerencie despesas em grupo de forma clara e automatizada. O Rate.io ajuda seu time a criar grupos, lançar gastos e acompanhar saldos reais.
              </p>
            </div>
            
            <div className='page-header__actions'>
              <Link to={actionRoute} className='btn btn-large btn-primary'>
                {actionLabel}
              </Link>
              <a href='#como-funciona' className='btn btn-ghost'>Ver como funciona</a>
            </div>
          </div>
        
          {/* HERO PANEL - Simulando a interface real com shared.css */}
          <aside style={{ flex: '1 1 350px', background: 'var(--bg)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(32, 11, 136, 0.08)' }}>
            
            {/* Card de Estatística (Igual ao Dashboard) */}
            <div className='stat-card' style={{ marginBottom: '24px', padding: '16px 20px' }}>
              <p className='stat-label'>Valores a receber</p>
              <p className='stat-value stat-value--positive'>+R$ 200,00</p>
            </div>

            <div className='section-block__title' style={{ fontSize: '0.9rem' }}>
              Grupos ativos: 3
            </div>

            {/* Lista de Pendências (Igual ao Dashboard) */}
            <div className='pending-list'>
              <div className='pending-card' style={{ padding: '12px 16px' }}>
                <div className='pending-card-info'>
                  <span className='pending-card-title'>República PUC</span>
                  <span className='pending-card-meta'>5 participantes</span>
                </div>
                <div className='pending-card-right'>
                  <span className='pending-card-amount pending-card-amount--positive'>+R$ 350</span>
                </div>
              </div>

              <div className='pending-card' style={{ padding: '12px 16px' }}>
                <div className='pending-card-info'>
                  <span className='pending-card-title'>Viagem Rio</span>
                  <span className='pending-card-meta'>8 participantes</span>
                </div>
                <div className='pending-card-right'>
                  <span className='pending-card-amount pending-card-amount--negative'>-R$ 150</span>
                </div>
              </div>

              <div className='pending-card' style={{ padding: '12px 16px' }}>
                <div className='pending-card-info'>
                  <span className='pending-card-title'>Jantar Grupo</span>
                  <span className='pending-card-meta'>4 participantes</span>
                </div>
                <div className='pending-card-right'>
                  <span className='pending-card-amount pending-card-amount--neutral'>R$ 0</span>
                </div>
              </div>
            </div>
          </aside>
          
        </section>

        {/* HERO BANNER - SLIDER DE INFORMAÇÕES */}
        <section className='content-wrap' style={{ marginBottom: '80px' }}>
          <div className='hero-banner-slider'>
              {slides.map((item, index) => (
                  <article
                  key={item.title}
                  className={`banner-slide ${index === activeSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  >
                  <p className='stat-value' style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{item.title}</p>
                  <p className='stat-label' style={{ textTransform: 'none', letterSpacing: 'normal' }}>{item.description}</p>
                  <img src={item.imageSource} alt={item.title} style={{ marginTop: '16px', borderRadius: '16px', border: '1px solid var(--border)' }} />
                  </article>
              ))}
          </div>
        </section>

        {/* COMO FUNCIONA - Usando a Shortcuts Grid */}
        <section className='section-block content-wrap' id='como-funciona'>
          <div className='page-header' style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '40px' }}>
            <div className='page-header__text'>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text-h)' }}>Como o Rateio funciona</h2>
              <p>Mostramos o essencial primeiro e só revelamos o rateio avançado quando o grupo precisa dele.</p>
            </div>
          </div>
          
          {/* Sobrescrevendo a grid para 3 colunas via estilo inline no desktop */}
          <div className='shortcuts-grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className='shortcut-card'>
              <span className='shortcut-card__icon'>👥</span>
              <strong className='shortcut-card__title'>1. Crie grupos</strong>
              <span className='shortcut-card__desc'>Adicione membros e organize despesas por contexto: república, viagem, evento.</span>
            </div>
            
            <div className='shortcut-card'>
              <span className='shortcut-card__icon'>💸</span>
              <strong className='shortcut-card__title'>2. Lance despesas</strong>
              <span className='shortcut-card__desc'>Registre gastos e escolha como dividir: igual, percentual ou valor exato.</span>
            </div>
            
            <div className='shortcut-card'>
              <span className='shortcut-card__icon'>✅</span>
              <strong className='shortcut-card__title'>3. Acerte as contas</strong>
              <span className='shortcut-card__desc'>Veja quem pagou, quem deve e finalize os acertos com clareza e transparência.</span>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION FINAL */}
        <section className='empty-state content-wrap' style={{ marginTop: '60px', padding: '60px 24px' }}>
          <span className='empty-state-icon'>🚀</span>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>Pronto para aposentar suas planilhas?</h2>
          <p className='empty-state-message' style={{ maxWidth: '400px', marginBottom: '16px' }}>
            Organize suas finanças compartilhadas de forma simples e automática.
          </p>
          <Link to={actionRoute} className='btn btn-primary'>
            {isAuthenticated ? 'Acessar painel' : 'Começar agora'}
          </Link>
        </section>
      </main>
    </div>
  )
}

export default LandingPage