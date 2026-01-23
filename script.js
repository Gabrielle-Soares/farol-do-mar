const produtos = [
    { id: 101, nome: "Filé de Pirarucu (Pedaço Limpo) - 1kg", preco: 45.00, imagem: "assets/img/File-de-Pirarucu.png" },
    { id: 102, nome: "Tambaqui (1kg)", preco: 18.00, imagem: "assets/img/tambaqui.jpg" },
    { id: 103, nome: "Filé de Pescada Amarela (Inteira - 1kg)", preco: 35.00, imagem: "assets/img/pescadaamarela.png" },
    { id: 104, nome: "Filé de Dourada (1kg)", preco: 25.00, imagem: "assets/img/file-dourado-congelado1.png" },
    { id: 105, nome: "Filé de Gó (1kg)", preco: 20.00, imagem: "assets/img/file-de-go.png" },
    { id: 106, nome: "Filé de Tilápia (1kg)", preco: 40.00, imagem: "assets/img/tilapia.png" },
    { id: 107, nome: "Camarão Regional Fresco (500g)", preco: 55.00, imagem: "assets/img/camarao.png" }
];

let carrinho = [];
let dadosCliente = null; 


const WHATSAPP_NUMERO = '5591987654321'; // 
const valorFrete = 10.00; 
const LIMITE_FRETE_GRATIS = 100.00;

// Elementos DOM
const cardapioEl = document.getElementById('cardapio');
const listaCarrinhoEl = document.getElementById('lista-carrinho');
const valorSubtotalEl = document.getElementById('valor-subtotal'); 
const valorFreteEl = document.getElementById('valor-frete'); 
const valorTotalEl = document.getElementById('valor-total');
const btnFinalizar = document.getElementById('btn-finalizar');
const btnEsvaziar = document.getElementById('btn-esvaziar');
const formCliente = document.getElementById('form-cliente');
const dadosClienteResumoEl = document.getElementById('dados-cliente-resumo');
const observacoesEl = document.getElementById('observacoes'); 
const freteMensagemEl = document.getElementById('frete-mensagem'); 


const modalEl = document.getElementById('modal-pedido');
const fecharModalEl = document.querySelector('.fechar-modal');
const textoPedidoEl = document.getElementById('texto-pedido-final');
const btnEnviarWhatsappEl = document.getElementById('btn-enviar-whatsapp');


const formatarPreco = (preco) => `R$ ${preco.toFixed(2).replace('.', ',')}`;


function salvarDadosCliente() {
    // Captura os dados dos inputs
    dadosCliente = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value
    };

    // Salva no navegador para não perder ao atualizar a página
    localStorage.setItem('dadosCliente', JSON.stringify(dadosCliente));

    // --- COMANDO PARA LIMPAR OS CAMPOS ---
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('endereco').value = '';

    renderizarResumoCliente();
    alert('Dados do cliente salvos com sucesso!');
}

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function carregarFormularioCliente() {
    if (dadosCliente) {
        document.getElementById('nome').value = dadosCliente.nome;
        document.getElementById('telefone').value = dadosCliente.telefone;
        document.getElementById('endereco').value = dadosCliente.endereco;
    }
}


formCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    salvarDadosCliente();
});

function renderizarResumoCliente() {
    if (dadosCliente) {
        dadosClienteResumoEl.innerHTML = `
            <p><strong>Cliente:</strong> ${dadosCliente.nome}</p>
            <p><strong>Telefone:</strong> ${dadosCliente.telefone}</p>
            <p><strong>Entrega:</strong> ${dadosCliente.endereco}</p>
        `;
        dadosClienteResumoEl.classList.add('dados-salvos');
        dadosClienteResumoEl.classList.remove('alerta-cadastro');
    } else {
        dadosClienteResumoEl.innerHTML = `
            <p class="alerta-cadastro">🚨 Preencha seus dados para finalizar o pedido.</p>
        `;
        dadosClienteResumoEl.classList.remove('dados-salvos');
    }
}


function renderizarCardapio() {
    cardapioEl.innerHTML += produtos.map(produto => `
        <div class="item-cardapio">
            <img src="${produto.imagem}" alt="${produto.nome}">
            <div class="info-texto">
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2).replace('.', ',')} / Kg</p>
            </div>
            <div class="preco-acao">
                <div class="quantidade-kg">
                    <input type="number" id="qtd-${produto.id}" min="0.5" step="0.5" value="1.0">
                    <span>Kg</span>
                </div>
                <button class="btn-adicionar" data-id="${produto.id}">Adicionar</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-adicionar').forEach(button => {
        button.addEventListener('click', adicionarAoCarrinho);
    });
}


function adicionarAoCarrinho(event) {
    const idProduto = parseInt(event.target.dataset.id);
    const inputQtdEl = document.getElementById(`qtd-${idProduto}`);
    const quantidade = parseFloat(inputQtdEl.value);

    if (quantidade <= 0.4 || isNaN(quantidade)) {
        alert("Por favor, digite uma quantidade válida em Kg (mínimo 0.5kg).");
        return;
    }

    const produto = produtos.find(p => p.id === idProduto);
    if (produto) {
        const itemExistenteIndex = carrinho.findIndex(item => item.id === idProduto);

        if (itemExistenteIndex !== -1) {
            carrinho[itemExistenteIndex].quantidade += quantidade;
        } else {
            carrinho.push({ ...produto, quantidade: quantidade });
        }
    }
    salvarCarrinho();
    renderizarCarrinho();
    inputQtdEl.value = '1.0';
}


function removerDoCarrinho(event) {
    const idProduto = parseInt(event.target.dataset.id);
    const index = carrinho.findIndex(item => item.id === idProduto);

    if (index !== -1) {
        carrinho.splice(index, 1); 
        salvarCarrinho();
        renderizarCarrinho();
    }
}


function esvaziarCarrinho() {
    if (carrinho.length > 0) {
        if (confirm("Tem certeza que deseja esvaziar todo o seu carrinho?")) {
            carrinho = [];
            localStorage.removeItem('carrinho');
            renderizarCarrinho();
            alert("Carrinho esvaziado com sucesso!");
        }
    } else {
        alert("Seu carrinho já está vazio.");
    }
}


function renderizarCarrinho() {
    listaCarrinhoEl.innerHTML = '';
    let subtotal = 0;

    if (carrinho.length === 0) {
        listaCarrinhoEl.innerHTML = '<li style="color:#777; text-align:center;">Seu cesto de pesca está vazio.</li>';
        subtotal = 0;
    } else {
        carrinho.forEach(item => {
            const subtotalItem = item.preco * item.quantidade;
            subtotal += subtotalItem;

            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.nome} (${item.quantidade.toFixed(1)} Kg)</span>
                <div>
                    <span style="font-weight:700; color:var(--cor-primaria); margin-right: 10px;">${formatarPreco(subtotalItem)}</span>
                    <button class="btn-remover" data-id="${item.id}">X</button>
                </div>
            `;
            listaCarrinhoEl.appendChild(li);
        });

        document.querySelectorAll('.btn-remover').forEach(button => {
            button.addEventListener('click', removerDoCarrinho);
        });
    }

  
    let freteCalculado = subtotal >= LIMITE_FRETE_GRATIS ? 0.00 : valorFrete;
    const totalGeral = subtotal + freteCalculado;


    let mensagemHTML = '';
    if (subtotal >= LIMITE_FRETE_GRATIS && subtotal > 0) {
        mensagemHTML = `<p class="frete-alerta sucesso">🎉 Frete Grátis! Você economizou ${formatarPreco(valorFrete)}.</p>`;
    } else if (subtotal > 0) {
        const falta = LIMITE_FRETE_GRATIS - subtotal;
        mensagemHTML = `<p class="frete-alerta falta">Faltam ${formatarPreco(falta)} para Frete Grátis!</p>`;
    } else {
        mensagemHTML = `<p class="frete-alerta falta">Pedidos acima de ${formatarPreco(LIMITE_FRETE_GRATIS)} têm Frete Grátis em Belém e Ananindeua!</p>`;
    }
    freteMensagemEl.innerHTML = mensagemHTML;


    valorSubtotalEl.textContent = formatarPreco(subtotal);
    valorFreteEl.textContent = formatarPreco(freteCalculado);
    valorTotalEl.textContent = formatarPreco(totalGeral);
}



function construirMensagemPedido(total, subtotal, frete, observacoes, pedidoDetalhes) {
    return `🎉 NOVO PEDIDO - PEIXE FRESH 🎉\n\n*DADOS DO CLIENTE:*\n
Nome: ${dadosCliente.nome}\n
Tel/WhatsApp: ${dadosCliente.telefone}\n
Endereço: ${dadosCliente.endereco}\n\n
==========================\n
*ITENS DO PEDIDO:*\n${pedidoDetalhes}\n\n
*OBSERVAÇÕES:*\n${observacoes}\n\n
==========================\n
*RESUMO DE VALORES:*\n
Subtotal: ${subtotal}\n
Frete: ${frete}\n
*TOTAL FINAL: ${total}*\n\n
_Aguarde a confirmação da loja e o prazo de entrega._`;
}


btnFinalizar.addEventListener('click', () => {
    if (!dadosCliente) {
        alert("Atenção! Por favor, preencha seus dados na seção 'Dados do Cliente' antes de finalizar.");
        return;
    }
    
    if (carrinho.length === 0) {
        alert("Adicione os pescados ao carrinho para confirmar o pedido.");
        return;
    }

    const subtotal = valorSubtotalEl.textContent;
    const frete = valorFreteEl.textContent;
    const total = valorTotalEl.textContent;
    const observacoes = observacoesEl.value.trim() || 'Nenhuma observação de corte/preparo.';

    const pedidoDetalhes = carrinho.map(item => `- ${item.nome} (${item.quantidade.toFixed(1)} Kg) - ${formatarPreco(item.preco * item.quantidade)}`).join('\n');
    
 
    const mensagemFinal = construirMensagemPedido(total, subtotal, frete, observacoes, pedidoDetalhes);


    textoPedidoEl.textContent = mensagemFinal;
    
   
    const mensagemEncoded = encodeURIComponent(mensagemFinal);
    btnEnviarWhatsappEl.dataset.whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensagemEncoded}`;

   
    modalEl.style.display = 'block';
});


btnEnviarWhatsappEl.addEventListener('click', () => {
    const linkWhatsapp = btnEnviarWhatsappEl.dataset.whatsappLink;
    
    window.open(linkWhatsapp, '_blank');
    

    carrinho = [];
    observacoesEl.value = ''; 
    localStorage.removeItem('carrinho');
    
 
    modalEl.style.display = 'none';
    alert("Pedido enviado! Verifique o WhatsApp para a confirmação final.");
    renderizarCarrinho();
});



fecharModalEl.addEventListener('click', () => {
    modalEl.style.display = 'none';
});


window.addEventListener('click', (event) => {
    if (event.target == modalEl) {
        modalEl.style.display = 'none';
    }
});


btnEsvaziar.addEventListener('click', esvaziarCarrinho);



document.addEventListener('DOMContentLoaded', () => {
    
    const clienteSalvo = localStorage.getItem('dadosCliente');
    if (clienteSalvo) {
        dadosCliente = JSON.parse(clienteSalvo);
    }
    
 
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
    }
    
    renderizarCardapio();
    renderizarCarrinho();
    renderizarResumoCliente(); 
    carregarFormularioCliente(); 
});