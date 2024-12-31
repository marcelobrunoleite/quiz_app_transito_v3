document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    carregarRanking();
    setupPerformanceChart(currentUser.id);
    updateStatistics();

    // Configuração do menu mobile
    function setupMobileMenu() {
        const menuHamburguer = document.querySelector('.menu-hamburguer');
        const menuPrincipal = document.querySelector('.menu-principal');
        const body = document.body;
        
        if (!menuHamburguer || !menuPrincipal) return;

        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        body.appendChild(overlay);

        // Toggle menu
        menuHamburguer.addEventListener('click', () => {
            menuHamburguer.classList.toggle('ativo');
            menuPrincipal.classList.toggle('ativo');
            overlay.classList.toggle('ativo');
            body.style.overflow = menuPrincipal.classList.contains('ativo') ? 'hidden' : '';
        });

        // Fechar menu ao clicar no overlay
        overlay.addEventListener('click', () => {
            menuHamburguer.classList.remove('ativo');
            menuPrincipal.classList.remove('ativo');
            overlay.classList.remove('ativo');
            body.style.overflow = '';
        });

        // Fechar menu ao clicar em um link
        menuPrincipal.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuHamburguer.classList.remove('ativo');
                menuPrincipal.classList.remove('ativo');
                overlay.classList.remove('ativo');
                body.style.overflow = '';
            });
        });
    }

    // Chamar a função de setup do menu
    setupMobileMenu();
});

function carregarRanking() {
    try {
        const results = JSON.parse(localStorage.getItem('quizResults')) || [];
        
        // Calcular médias por usuário
        const userStats = {};
        results.forEach(result => {
            if (!userStats[result.userId]) {
                userStats[result.userId] = {
                    name: result.userName,
                    totalScore: 0,
                    simulations: 0,
                    bestScore: 0
                };
            }
            
            userStats[result.userId].totalScore += result.score;
            userStats[result.userId].simulations++;
            userStats[result.userId].bestScore = Math.max(userStats[result.userId].bestScore, result.score);
        });

        // Converter para array e ordenar
        const rankingData = Object.entries(userStats)
            .map(([userId, stats]) => ({
                userId,
                name: stats.name,
                score: stats.bestScore,
                simulations: stats.simulations,
                average: (stats.totalScore / stats.simulations).toFixed(1)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // Atualizar pódio
        updatePodium(rankingData);

        // Atualizar tabela de ranking geral
        const rankingContainer = document.getElementById('ranking-list');
        if (!rankingContainer) {
            console.error('Container do ranking não encontrado');
            return;
        }

        if (results.length === 0) {
            rankingContainer.innerHTML = '<p class="sem-resultados">Nenhum resultado disponível ainda.</p>';
            return;
        }

        // Criar tabela de ranking
        const rankingHTML = `
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Usuário</th>
                        <th>Melhor Pontuação</th>
                        <th>Simulados</th>
                        <th>Média</th>
                        <th>Último Modo</th>
                    </tr>
                </thead>
                <tbody>
                    ${rankingData.map((player, index) => `
                        <tr>
                            <td>${index + 1}º</td>
                            <td>${player.name}</td>
                            <td>${player.score.toFixed(1)}%</td>
                            <td>${player.simulations}</td>
                            <td>${player.average}%</td>
                            <td>${results.find(r => r.userId === player.userId)?.modo || 'Padrão'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        rankingContainer.innerHTML = rankingHTML;

    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        document.getElementById('ranking-list').innerHTML = '<p class="erro">Erro ao carregar o ranking.</p>';
    }
}

function updatePodium(rankingData) {
    const podiumPlaces = {
        first: rankingData[0] || { name: "Vazio", score: 0 },
        second: rankingData[1] || { name: "Vazio", score: 0 },
        third: rankingData[2] || { name: "Vazio", score: 0 }
    };

    Object.entries(podiumPlaces).forEach(([place, data]) => {
        const placeElement = document.querySelector(`.${place}`);
        if (placeElement) {
            placeElement.querySelector('.name').textContent = data.name;
            placeElement.querySelector('.score').textContent = `${data.score.toFixed(1)}%`;
        }
    });
}

function setupPerformanceChart(userId) {
    const results = JSON.parse(localStorage.getItem('quizResults')) || [];
    const userResults = results
        .filter(r => r.userId === userId)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-6);

    const ctx = document.getElementById('performanceChart')?.getContext('2d');
    if (!ctx) return;
    
    const performanceData = {
        labels: userResults.map(r => formatarData(r.date)),
        datasets: [{
            label: 'Média de Acertos',
            data: userResults.map(r => r.score),
            borderColor: '#00fff2',
            backgroundColor: 'rgba(0, 255, 242, 0.1)',
            tension: 0.4
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: performanceData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

function updateStatistics() {
    const results = JSON.parse(localStorage.getItem('quizResults')) || [];
    
    const stats = {
        totalSimulados: results.length,
        mediaGeral: results.reduce((acc, r) => acc + r.score, 0) / results.length || 0,
        taxaAprovacao: (results.filter(r => r.score >= 70).length / results.length) * 100 || 0
    };

    const statElements = document.querySelectorAll('.stat-value');
    if (statElements.length >= 3) {
        statElements[0].textContent = stats.totalSimulados;
        statElements[1].textContent = `${stats.mediaGeral.toFixed(1)}%`;
        statElements[2].textContent = `${stats.taxaAprovacao.toFixed(1)}%`;
    }
}

function formatarData(dateString) {
    try {
        const data = new Date(dateString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
} 