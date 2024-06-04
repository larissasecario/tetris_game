import { S, J, T, Z, L, O, I } from './shapes.js';


// Seleção dos elementos html 
const score_elemento = document.getElementById("score");
const btn_jogar_novamente = document.getElementById('bnt-jogar-novamente');
const canvas_tela_game = document.getElementById("meu-canvas");
const canvas_tela_next = document.getElementById("proximo-elemento");

// Pegando context para construir elementos no canvas 
const ctx = canvas_tela_game.getContext("2d");
const ctx_next = canvas_tela_next.getContext("2d");


// Definição das variáveis constantes 
const LINHA = 20;
const COLUNA = 10;
const TAMANHO_QUADRADO = 40;
const QUADRADO_VAZIO = "#070F2B"; // A cor do quadrado vazio

const ELEMENTOS = [
    [S, "#a3289d"],
    [J, "#1465a6"],
    [T, "#ebd400"],
    [Z, "#da8400"],
    [L, "#3da438"],
    [O, "#cc0a10"],
    [I, "#57afbc"],
];

// Inicialização das variáveis 
let score = 0;
let level = 1
let velocidade_descida = 1000;

// Criação da tela do jogo utilizando matriz 20x10
let tela_jogo = [];
for (let lin = 0; lin < LINHA; lin++) {
    tela_jogo[lin] = [];
    for (let col = 0; col < COLUNA; col++) {
        tela_jogo[lin][col] = QUADRADO_VAZIO;
    }
}



// Classe Elemento
class Elemento {
    constructor(tetromino, cor) {
        this.tetromino = tetromino;
        this.cor = cor;
        this.tetromino_numero = 0;
        this.tetromino_ativo = this.tetromino[this.tetromino_numero]; // Tetromino que está sendo jogado

        // posicionar os tretominoes 
        this.x = 3;
        this.y = -2;
    }

    preencher_elemento(cor) {
        for (let lin = 0; lin < this.tetromino_ativo.length; lin++) {
            for (let col = 0; col < this.tetromino_ativo.length; col++) {
                // Desenhar apenas os quadrados com valores diferentes de 0
                if (this.tetromino_ativo[lin][col]) {
                    desenhar_quadrado(this.x + col, this.y + lin, cor);
                }
            }
        }
    }

    desenhar_elemento() {
        this.preencher_elemento(this.cor);
    }

    limpar_desenho() {
        this.preencher_elemento(QUADRADO_VAZIO);
    }

    // Funções para movimentar os tetrominoes
    mover_baixo() {
        if (!this.colisao(0, 1, this.tetromino_ativo)) {
            this.limpar_desenho();
            this.y++;
            this.desenhar_elemento();
        } else {
            this.bloqueio_elemento();
        }
    }

    mover_direita() {
        if (!this.colisao(1, 0, this.tetromino_ativo)) {
            this.limpar_desenho();
            this.x++;
            this.desenhar_elemento();
        }
    }

    mover_esquerda() {
        if (!this.colisao(-1, 0, this.tetromino_ativo)) {
            this.limpar_desenho();
            this.x--;
            this.desenhar_elemento();
        }
    }

    rotacionar_elemento() {
        let proxima_rotacao = this.tetromino[(this.tetromino_numero + 1) % this.tetromino.length];
        let chute = 0;

        if (this.colisao(0, 0, proxima_rotacao)) {
            if (this.x > COLUNA / 2) {
                // BORDA DIREITA
                chute = -1;
            } else {
                // BORDA ESQUERDA
                chute = 1;
            }
        }

        if (!this.colisao(chute, 0, proxima_rotacao)) {
            this.limpar_desenho();
            this.x += chute;
            this.tetromino_numero = (this.tetromino_numero + 1) % this.tetromino.length; //(0+1)%4 = 1
            this.tetromino_ativo = this.tetromino[this.tetromino_numero];
            this.desenhar_elemento();
        }
    }

    colisao(x, y, elemento_atual) {
        for (let lin = 0; lin < elemento_atual.length; lin++) {
            for (let col = 0; col < elemento_atual.length; col++) {
                // Verificar se quadrado está vazio. Se sim, continua 
                if (!elemento_atual[lin][col]) {
                    continue;
                }

                let novo_x = this.x + col + x;
                let novo_y = this.y + lin + y;
                if (novo_x < 0 || novo_x >= COLUNA || novo_y >= LINHA) {
                    return true;
                }

                if (novo_y < 0) {
                    continue;
                }

                if (tela_jogo[novo_y][novo_x] != QUADRADO_VAZIO) {
                    return true;
                }
            }
        }
        return false;
    }

    bloqueio_elemento() {
        for (let lin = 0; lin < this.tetromino_ativo.length; lin++) {
            for (let col = 0; col < this.tetromino_ativo.length; col++) {
                if (!this.tetromino_ativo[lin][col]) {
                    continue;
                }
                if (this.y + lin < 0) {
                    // Para animação e chamar tela de fim de game
                    gameOver = true;
                    tela_game_over()
                    break;
                }
                tela_jogo[this.y + lin][this.x + col] = this.cor;
            }
        }

        // Remover a linha completa
        for (let lin = 0; lin < LINHA; lin++) {
            let isLinhaCompleta = true;
            for (let col = 0; col < COLUNA; col++) {
                isLinhaCompleta = isLinhaCompleta && (tela_jogo[lin][col] != QUADRADO_VAZIO);
            }
            if (isLinhaCompleta) {
                for (let y = lin; y > 1; y--) {
                    for (let col = 0; col < COLUNA; col++) {
                        tela_jogo[y][col] = tela_jogo[y - 1][col];
                    }
                }

                // Limpar a linha superior
                for (let col = 0; col < COLUNA; col++) {
                    tela_jogo[0][col] = QUADRADO_VAZIO;
                }
                score += 10;
            }
        }
        desenhar_tela_jogo();
        score_elemento.innerHTML = score;
        atualizar_level();

        // Atualizar os elementos
        elemento_jogo = proximo_elemento;
        proximo_elemento = elemento_aleatorio();
        desenhar_proximo_elemento(proximo_elemento.tetromino[0], proximo_elemento.cor);
    }
}


// Definição das funções do jogo  
function elemento_aleatorio() {
    let numero_aleatorio = Math.floor(Math.random() * ELEMENTOS.length); // Retorna número entre 0 a 6
    let tetromino = ELEMENTOS[numero_aleatorio][0];
    let cor = ELEMENTOS[numero_aleatorio][1];
    return new Elemento(tetromino, cor);
}


let elemento_jogo = elemento_aleatorio();
let proximo_elemento = elemento_aleatorio();



function desenhar_quadrado(x, y, cor) {
    ctx.fillStyle = cor;
    ctx.fillRect(x * TAMANHO_QUADRADO, y * TAMANHO_QUADRADO, TAMANHO_QUADRADO, TAMANHO_QUADRADO);

    ctx.strokeStyle = "#070F2B"; // Cor do contorno
    ctx.strokeRect(x * TAMANHO_QUADRADO, y * TAMANHO_QUADRADO, TAMANHO_QUADRADO, TAMANHO_QUADRADO);
}


function desenhar_tela_jogo() {
    for (let lin = 0; lin < LINHA; lin++) {
        for (let col = 0; col < COLUNA; col++) {
            desenhar_quadrado(col, lin, tela_jogo[lin][col]);
        }
    }
}

// Função para controlar o tempo
let inicio_descida = Date.now();
let gameOver = false;
function soltar_elemento() {
    let agora = Date.now();
    let delta = agora - inicio_descida;
    // 1000 = 1s
    if (delta > velocidade_descida) {
        elemento_jogo.mover_baixo();
        inicio_descida = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(soltar_elemento);
    }
}

// Funções para escutar os teclados 
document.addEventListener("keydown", controlar_elemento);
function controlar_elemento(event) {
    // Esquerda e A
    if (event.keyCode == 37 || event.keyCode == 65) {
        elemento_jogo.mover_esquerda();
        inicio_descida = Date.now();
    // Direita e D
    } else if (event.keyCode == 39 || event.keyCode == 68) {
        elemento_jogo.mover_direita();
        inicio_descida = Date.now();
    // Baixo e S
    } else if (event.keyCode == 40 || event.keyCode == 83) {
        elemento_jogo.mover_baixo();
    // Cima e W
    } else if (event.keyCode == 38 || event.keyCode == 87) {
        elemento_jogo.rotacionar_elemento();
        inicio_descida = Date.now();
    }
}

// Função para criar tela para mostrar qual será o proximo elemento 
function tela_proximo_elemento() {
    const LINHA_TELA_NEXT = 4;
    const COLUNA_TELA_NEXT = 4;
    
    let tela_next = [];
    for (let lin = 0; lin < LINHA_TELA_NEXT; lin++) {
        tela_next[lin] = [];
        for (let col = 0; col < COLUNA_TELA_NEXT; col++) {
            tela_next[lin][col] = QUADRADO_VAZIO;
        }
    }

    for (let lin = 0; lin < LINHA_TELA_NEXT; lin++) {
        for (let col = 0; col < COLUNA_TELA_NEXT; col++) {
            desenhar_quadrado_next(col, lin, tela_next[lin][col]);
        }
    }
}

function desenhar_quadrado_next(x, y, cor) {
    const TAMANHO_QUADRADO_NEXT = 35;
    ctx_next.fillStyle = cor;
    ctx_next.fillRect(x * TAMANHO_QUADRADO_NEXT, y * TAMANHO_QUADRADO_NEXT, TAMANHO_QUADRADO_NEXT, TAMANHO_QUADRADO_NEXT);

    ctx_next.strokeStyle = ""; // Cor do contorno
    ctx_next.strokeRect(x * TAMANHO_QUADRADO_NEXT, y * TAMANHO_QUADRADO_NEXT, TAMANHO_QUADRADO_NEXT, TAMANHO_QUADRADO_NEXT);
}

// Função para desenhar o proximo elemento 
function desenhar_proximo_elemento(tetromino, cor) {
    const TAMANHO_QUADRADO_NEXT = 35;

    // Limpar a tela "proximo-elemento"
    ctx_next.clearRect(0, 0, canvas_tela_next.width, canvas_tela_next.height);


    // Ajuste do offset para centralizar melhor no canvas
    let startX = (canvas_tela_next.width - (tetromino[0].length * TAMANHO_QUADRADO_NEXT)) / 2;
    let startY = (canvas_tela_next.height - (tetromino.length * TAMANHO_QUADRADO_NEXT)) / 2;

    // Desenhar o tetromino na tela "proximo-elemento"
    for (let lin = 0; lin < tetromino.length; lin++) {
        for (let col = 0; col < tetromino[lin].length; col++) {
            if (tetromino[lin][col]) {
                desenhar_quadrado_next(startX / TAMANHO_QUADRADO_NEXT + col, startY / TAMANHO_QUADRADO_NEXT + lin, cor);
            }
        }
    }
}


function atualizar_level(){
    level = Math.floor(score/100) + 1
    document.getElementById("level").innerText = level;
}


// Função para habilitar a div "game over" que está desativada no html
function tela_game_over(){
    const tela_fim_game = document.getElementById("game-over")
    tela_fim_game.style.display = "flex";
}


btn_jogar_novamente.addEventListener('click', reiniciarJogo);
function reiniciarJogo(){
    window.location.reload();

}


desenhar_tela_jogo();
soltar_elemento();
tela_proximo_elemento();
elemento_jogo.desenhar_elemento();
desenhar_proximo_elemento(proximo_elemento.tetromino[0], proximo_elemento.cor);
