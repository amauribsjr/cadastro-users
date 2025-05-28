document.addEventListener('DOMContentLoaded', () => {
    const linksNavegacao = document.querySelectorAll('header nav a');
    const abasConteudo = document.querySelectorAll('.aba-conteudo');

    const formularioCadastro = document.getElementById('cadastro-form');
    const campoNome = document.getElementById('nome');
    const campoEmail = document.getElementById('email');
    const campoCPF = document.getElementById('cpf');
    const campoIdade = document.getElementById('idade');
    const feedbackCadastro = document.getElementById('cadastro-feedback');

    const corpoTabelaUsuarios = document.getElementById('usuarios-tbody');
    const botaoApagarTudo = document.getElementById('apagar-tudo-btn');
    const feedbackLista = document.getElementById('lista-feedback');

    const campoCEP = document.getElementById('cep-input');
    const campoRua = document.getElementById('rua');
    const campoBairro = document.getElementById('bairro');
    const campoCidade = document.getElementById('cidade');
    const campoEstado = document.getElementById('estado');
    const consultarCepBotao = document.getElementById('consultar-cep-btn');
    const cepFeedback = document.getElementById('cep-feedback');

    const modalEdicao = document.getElementById('modal-edicao');
    const formEdicao = document.getElementById('form-edicao');
    const editNomeInput = document.getElementById('edit-nome');
    const editEmailInput = document.getElementById('edit-email');
    const editCPFInput = document.getElementById('edit-cpf');
    const editIdadeInput = document.getElementById('edit-idade');
    const cancelarEdicaoBotao = document.getElementById('cancelar-edicao');

    let indiceEdicao = -1;
    let usuarios = carregarUsuarios();
    renderizarListaUsuarios();

    function mostrarFeedback(elemento, mensagem, tipo) {
        elemento.textContent = mensagem;
        elemento.className = `feedback ${tipo}`;
        setTimeout(() => {
            elemento.textContent = '';
            elemento.className = 'feedback';
        }, 3000);
    }

    function mostrarAba(idAba) {
        abasConteudo.forEach(aba => {
            aba.classList.remove('ativa');
        });
        linksNavegacao.forEach(link => {
            link.classList.remove('ativo');
        });

        const abaAtiva = document.getElementById(idAba);
        const linkAtivo = document.querySelector(`header nav a[data-aba="${idAba}"]`);

        if (abaAtiva) {
            abaAtiva.classList.add('ativa');
        }
        if (linkAtivo) {
            linkAtivo.classList.add('ativo');
        }
    }

    mostrarAba('cadastro');

    linksNavegacao.forEach(link => {
        link.addEventListener('click', (evento) => {
            evento.preventDefault();
            const idAba = link.getAttribute('data-aba');
            mostrarAba(idAba);
            window.location.hash = idAba;
        });
    });

    if (window.location.hash) {
        mostrarAba(window.location.hash.substring(1));
    }

    campoNome.addEventListener('input', () => {
        campoNome.classList.remove('erro');
        campoNome.nextElementSibling.textContent = '';
    });

    campoEmail.addEventListener('input', () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campoEmail.value)) {
            campoEmail.classList.add('erro');
            campoEmail.nextElementSibling.textContent = 'Digite um email válido.';
        } else {
            campoEmail.classList.remove('erro');
            campoEmail.nextElementSibling.textContent = '';
        }
    });

    campoCPF.addEventListener('input', () => {
        if (campoCPF.value.length !== 11 && campoCPF.value.length > 0) {
            campoCPF.classList.add('erro');
            campoCPF.nextElementSibling.textContent = 'Digite um CPF válido (11 dígitos, sem pontos e traço).';
        } else {
            campoCPF.classList.remove('erro');
            campoCPF.nextElementSibling.textContent = '';
        }
    });

    campoIdade.addEventListener('input', () => {
        if (isNaN(parseInt(campoIdade.value)) || parseInt(campoIdade.value) < 0) {
            campoIdade.classList.add('erro');
            campoIdade.nextElementSibling.textContent = 'Digite uma idade válida.';
        } else {
            campoIdade.classList.remove('erro');
            campoIdade.nextElementSibling.textContent = '';
        }
    });

    formularioCadastro.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim();
        const cpf = campoCPF.value.trim();
        const idade = campoIdade.value.trim();

        if (!nome || !email || !cpf || !idade || campoNome.classList.contains('erro') || campoEmail.classList.contains('erro') || campoCPF.classList.contains('erro') || campoIdade.classList.contains('erro')) {
            mostrarFeedback(feedbackCadastro, 'Por favor, preencha todos os campos corretamente.', 'erro');
            return;
        }

        const novoUsuario = { nome, email, cpf, idade };
        usuarios.push(novoUsuario);
        salvarUsuarios();
        renderizarListaUsuarios();
        formularioCadastro.reset();
        mostrarFeedback(feedbackCadastro, 'Usuário cadastrado com sucesso!', 'sucesso');
    });

    function carregarUsuarios() {
        const data = localStorage.getItem('usuarios');
        return data ? JSON.parse(data) : [];
    }

    function salvarUsuarios() {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    function renderizarListaUsuarios() {
        corpoTabelaUsuarios.innerHTML = '';
        if (usuarios.length === 0) {
            const linha = corpoTabelaUsuarios.insertRow();
            const celula = linha.insertCell();
            celula.colSpan = 5;
            celula.textContent = 'Nenhum usuário cadastrado.';
            return;
        }

        usuarios.forEach((usuario, index) => {
            const linha = corpoTabelaUsuarios.insertRow();
            linha.insertCell().textContent = usuario.nome;
            linha.insertCell().textContent = usuario.email;
            linha.insertCell().textContent = formatarCPF(usuario.cpf);
            linha.insertCell().textContent = usuario.idade;

            const celulaAcoes = linha.insertCell();
            const botaoEditar = criarBotao('Editar', 'edit-btn', () => editarUsuario(index));
            const botaoExcluir = criarBotao('Excluir', 'delete-btn', () => excluirUsuario(index));
            celulaAcoes.appendChild(botaoEditar);
            celulaAcoes.appendChild(botaoExcluir);
        });
    }

    function criarBotao(texto, classe, eventoClique) {
        const botao = document.createElement('button');
        botao.textContent = texto;
        botao.className = classe;
        botao.addEventListener('click', eventoClique);
        return botao;
    }

    function formatarCPF(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function editarUsuario(indice) {
        const usuarioAEditar = usuarios[indice];
        alert(`Abrir modal de edição para: ${usuarioAEditar.nome} (índice ${indice})`);
        // Aqui você abriria o modal e preencheria os campos com usuarioAEditar

    }

    function excluirUsuario(indice) {
        if (confirm(`Tem certeza que deseja excluir o usuário ${usuarios[indice].nome}?`)) {
            usuarios.splice(indice, 1);
            salvarUsuarios();
            renderizarListaUsuarios();
            mostrarFeedback(listaFeedback, 'Usuário excluído com sucesso!', 'sucesso');
        }
    }

    botaoApagarTudo.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja apagar todos os usuários cadastrados?')) {
            localStorage.removeItem('usuarios');
            usuarios = [];
            renderizarListaUsuarios();
            mostrarFeedback(listaFeedback, 'Todos os usuários foram apagados.', 'sucesso');
        }
    });

    function abrirModalEdicao(indice) {
        const usuario = usuarios[indice];
        editNomeInput.value = usuario.nome;
        editEmailInput.value = usuario.email;
        editCPFInput.value = usuario.cpf;
        editIdadeInput.value = usuario.idade;
        indiceEdicao = indice;
        modalEdicao.classList.add('aberto');
    }

    function editarUsuario(indice) {
        abrirModalEdicao(indice);
    }

    cancelarEdicaoBotao.addEventListener('click', () => {
        modalEdicao.classList.remove('aberto');
        formEdicao.reset();
    });

    formEdicao.addEventListener('submit', (evento) => {
        evento.preventDefault();

        if (indiceEdicao !== -1) {
            const nomeEditado = editNomeInput.value.trim();
            const emailEditado = editEmailInput.value.trim();
            const cpfEditado = editCPFInput.value.trim();
            const idadeEditada = editIdadeInput.value.trim();

            if (!nomeEditado || !emailEditado || !cpfEditado || !idadeEditada) {
                alert('Por favor, preencha todos os campos.'); // Adicione validação mais robusta se necessário
                return;
            }

            usuarios[indiceEdicao] = {
                nome: nomeEditado,
                email: emailEditado,
                cpf: cpfEditado,
                idade: idadeEditada
            };

            salvarUsuarios();
            renderizarListaUsuarios();
            modalEdicao.classList.remove('aberto');
            formEdicao.reset();
            mostrarFeedback(listaFeedback, 'Usuário atualizado com sucesso!', 'sucesso');
            indiceEdicao = -1;
        }
    });

    async function buscarEnderecoPorCEP(cep) {
        cepFeedback.textContent = '';
        cepFeedback.className = 'feedback';
        if (cep.length === 8) {
            try {
                const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await resposta.json();

                if (!data.erro) {
                    campoRua.value = data.logradouro;
                    campoBairro.value = data.bairro;
                    campoCidade.value = data.localidade;
                    campoEstado.value = data.uf;
                    mostrarFeedback(cepFeedback, 'CEP encontrado!', 'sucesso');
                } else {
                    campoRua.value = '';
                    campoBairro.value = '';
                    campoCidade.value = '';
                    campoEstado.value = '';
                    mostrarFeedback(cepFeedback, 'CEP não encontrado.', 'erro');
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                mostrarFeedback(cepFeedback, 'Erro ao buscar CEP.', 'erro');
            }
        } else if (cep.length > 0) {
            mostrarFeedback(cepFeedback, 'Digite um CEP válido com 8 dígitos, sem pontos e traço.', 'erro');
            campoRua.value = '';
            campoBairro.value = '';
            campoCidade.value = '';
            campoEstado.value = '';
        } else {
            campoRua.value = '';
            campoBairro.value = '';
            campoCidade.value = '';
            campoEstado.value = '';
        }
    }

    consultarCepBotao.addEventListener('click', () => {
        const cep = campoCEP.value.replace(/\D/g, '');
        buscarEnderecoPorCEP(cep);
    });

    campoCEP.addEventListener('blur', () => {
        const cep = campoCEP.value.replace(/\D/g, '');
        if (cep.length !== 8 && cep.length > 0) {
            campoRua.value = '';
            campoBairro.value = '';
            campoCidade.value = '';
            campoEstado.value = '';
            mostrarFeedback(cepFeedback, 'Digite um CEP válido com 8 dígitos, sem pontos e traço.', 'erro');
        } else if (cep.length === 0) {
            campoRua.value = '';
            campoBairro.value = '';
            campoCidade.value = '';
            campoEstado.value = '';
            cepFeedback.textContent = '';
            cepFeedback.className = 'feedback';
        }
    });
});