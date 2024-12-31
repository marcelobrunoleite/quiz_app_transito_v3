document.addEventListener('DOMContentLoaded', function() {
    let tipoAtual = 'regulamentacao';
    let visualizacaoAtual = 'grade';
    let placas = []; // Array que vai armazenar todas as placas

    // Carregar placas do JSON
    async function carregarPlacas() {
        try {
            const response = await fetch('placas.json');
            if (!response.ok) throw new Error('Erro ao carregar placas');
            const data = await response.json();
            placas = data.placas; // Acessar o array de placas dentro do objeto
            console.log('Placas carregadas:', placas); // Debug
            filtrarEExibirPlacas();
        } catch (error) {
            console.error('Erro ao carregar placas:', error);
            const container = document.querySelector('.placas-grid');
            container.innerHTML = `
                <div class="erro-mensagem">
                    <h3>Erro ao carregar placas</h3>
                    <p>Por favor, tente novamente mais tarde.</p>
                </div>
            `;
        }
    }

    // Filtrar e exibir placas
    function filtrarEExibirPlacas(termoBusca = '') {
        console.log('Filtrando placas:', tipoAtual);
        const placasFiltradas = placas.filter(placa => {
            const matchTipo = placa.tipo === tipoAtual;
            const matchBusca = termoBusca === '' || 
                placa.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                placa.descricao.toLowerCase().includes(termoBusca.toLowerCase());
            return matchTipo && matchBusca;
        });

        console.log('Placas filtradas:', placasFiltradas);

        const container = document.querySelector('.placas-grid');
        container.className = visualizacaoAtual === 'lista' ? 'placas-lista' : 'placas-grid';
        
        if (placasFiltradas.length === 0) {
            container.innerHTML = `
                <div class="sem-resultados">
                    <p>Nenhuma placa encontrada.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = placasFiltradas.map(placa => `
            <div class="placa-card">
                <img src="${placa.imagem}" 
                    alt="${placa.nome}" 
                    class="placa-imagem"
                    onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzEwMTAyMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDBGN0ZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VtIG7Do28gZW5jb250cmFkYTwvdGV4dD48L3N2Zz4=';">
                <h3 class="placa-nome">${placa.nome}</h3>
                <p class="placa-descricao">${placa.descricao}</p>
            </div>
        `).join('');
    }

    // Event Listeners para os botões de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            tipoAtual = btn.dataset.tipo;
            console.log('Tipo selecionado:', tipoAtual); // Debug
            filtrarEExibirPlacas(document.getElementById('pesquisa-placas').value);
        });
    });

    // Event Listeners para os botões de visualização
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            visualizacaoAtual = btn.dataset.view;
            filtrarEExibirPlacas(document.getElementById('pesquisa-placas').value);
        });
    });

    // Event Listener para a pesquisa
    const pesquisaInput = document.getElementById('pesquisa-placas');
    let timeoutPesquisa;
    pesquisaInput.addEventListener('input', (e) => {
        clearTimeout(timeoutPesquisa);
        timeoutPesquisa = setTimeout(() => {
            filtrarEExibirPlacas(e.target.value);
        }, 300);
    });

    // Inicializar
    carregarPlacas();
}); 