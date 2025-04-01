document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const board = document.getElementById('game-board');
    const cells = [];
    const gameStatus = document.getElementById('game-status');
    const currentPlayerSpan = document.querySelector('.current-player');
    const playerXScore = document.querySelector('#playerX strong');
    const playerOScore = document.querySelector('#playerO strong');
    const tiesScore = document.querySelector('#ties strong');
    const resetBtn = document.getElementById('reset-btn');
    const resetScoreBtn = document.getElementById('reset-score-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const resultModal = document.getElementById('result-modal');
    const resultMessage = document.getElementById('result-message');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Variáveis do jogo
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let gameMode = 'pvp'; // pvp (player vs player) ou pve (player vs computer)
    let scores = {
        X: 0,
        O: 0,
        ties: 0
    };

    // Combinações vencedoras
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
        [0, 4, 8], [2, 4, 6]             // diagonais
    ];

    // Inicialização do jogo
    function initializeGame() {
        // Criar células do tabuleiro
        board.innerHTML = '';
        cells.length = 0;
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
            cells.push(cell);
        }
        
        // Resetar estado do jogo
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        updateGameStatus();
        
        // Remover classes de vitória
        cells.forEach(cell => {
            cell.classList.remove('winner', 'x', 'o');
        });
    }

    // Atualizar status do jogo
    function updateGameStatus() {
        currentPlayerSpan.textContent = currentPlayer;
        currentPlayerSpan.className = 'current-player';
        currentPlayerSpan.classList.add(currentPlayer.toLowerCase());
        
        const playerText = gameMode === 'pve' && currentPlayer === 'O' ? 'Computador' : `Jogador ${currentPlayer}`;
        gameStatus.innerHTML = `É a vez do <span class="current-player ${currentPlayer.toLowerCase()}">${currentPlayer}</span>`;
    }

    // Manipulador de clique na célula
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // Verificar se a célula já está preenchida ou se o jogo não está ativo
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        // Processar jogada do jogador humano
        processPlayerMove(clickedCell, clickedCellIndex);
        
        // Se for modo PvE e o jogo ainda estiver ativo, fazer jogada do computador
        if (gameMode === 'pve' && gameActive && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 800);
        }
    }

    // Processar jogada do jogador
    function processPlayerMove(cell, index) {
        // Atualizar estado do jogo e interface
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Verificar vitória ou empate
        checkGameResult();
        
        // Alternar jogador
        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateGameStatus();
        }
    }

    // Fazer jogada do computador (modo PvE)
    function makeComputerMove() {
        if (!gameActive) return;
        
        // Estratégia simples: tentar vencer, bloquear o jogador ou jogar aleatório
        let move = findWinningMove('O') || findWinningMove('X') || findRandomMove();
        
        if (move !== null) {
            const cell = cells[move];
            processPlayerMove(cell, move);
        }
    }

    // Encontrar jogada vencedora
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            // Verificar se há duas células iguais e uma vazia
            if (gameState[a] === player && gameState[b] === player && gameState[c] === '') return c;
            if (gameState[a] === player && gameState[c] === player && gameState[b] === '') return b;
            if (gameState[b] === player && gameState[c] === player && gameState[a] === '') return a;
        }
        return null;
    }

    // Encontrar jogada aleatória
    function findRandomMove() {
        const emptyCells = gameState.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);
        
        return emptyCells.length > 0 
            ? emptyCells[Math.floor(Math.random() * emptyCells.length)] 
            : null;
    }

    // Verificar resultado do jogo
    function checkGameResult() {
        let roundWon = false;
        
        // Verificar combinações vencedoras
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
                continue;
            }
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                
                // Destacar células vencedoras
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                break;
            }
        }
        
        // Se houver vitória
        if (roundWon) {
            const winner = currentPlayer;
            scores[winner]++;
            updateScores();
            gameActive = false;
            
            // Mostrar mensagem de vitória
            const winnerName = gameMode === 'pve' && winner === 'O' ? 'Computador' : `Jogador ${winner}`;
            resultMessage.textContent = `${winnerName} venceu!`;
            showResultModal();
            return;
        }
        
        // Verificar empate
        if (!gameState.includes('')) {
            scores.ties++;
            updateScores();
            gameActive = false;
            
            resultMessage.textContent = 'Empate!';
            showResultModal();
        }
    }

    // Atualizar placar
    function updateScores() {
        playerXScore.textContent = scores.X;
        playerOScore.textContent = scores.O;
        tiesScore.textContent = scores.ties;
    }

    // Mostrar modal de resultado
    function showResultModal() {
        resultModal.classList.add('show');
    }

    // Esconder modal de resultado
    function hideResultModal() {
        resultModal.classList.remove('show');
    }

    // Reiniciar partida
    function resetGame() {
        hideResultModal();
        initializeGame();
    }

    // Zerar placar
    function resetScores() {
        scores = { X: 0, O: 0, ties: 0 };
        updateScores();
    }

    // Alterar modo de jogo
    function setGameMode(mode) {
        gameMode = mode;
        modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        resetGame();
    }

    // Event Listeners
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScores);
    playAgainBtn.addEventListener('click', resetGame);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setGameMode(btn.dataset.mode));
    });

    // Iniciar o jogo
    initializeGame();
})