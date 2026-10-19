
import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://ulaqohbfagajzrmxqlzd.supabase.co";
const SUPABASE_KEY = "sb_publishable_Q6qKuuMOXHqzzW12Vb8QlA_ujgzEDJq";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const questions = [
    {
        question: "O que é Aprendizado Supervisionado?",
        options: [
            "Um modelo treinado com dados que possuem rótulos (entradas e saídas esperadas).",
            "Um algoritmo que aprende totalmente sozinho sem nenhum dado prévio.",
            "Um método exclusivo para deletar dados inconsistentes em bancos de dados.",
            "Uma técnica restrita à robótica industrial pesada."
        ],
        correct: 0
    },
    {
        question: "Qual algoritmo é mais indicado para tarefas de Classificação Binária?",
        options: [
            "Regressão Linear",
            "Regressão Logística",
            "K-Means Clustering",
            "Análise de Componentes Principais (PCA)"
        ],
        correct: 1
    },
    {
        question: "O que caracteriza o problema de 'Overfitting'?",
        options: [
            "O modelo é simples demais e erra tanto nos dados de treino quanto nos de teste.",
            "O modelo memorizou os dados de treino e falha ao tentar generalizar dados novos.",
            "O computador para de responder por excesso de uso de memória RAM.",
            "A base de dados contém poucas variáveis para análise."
        ],
        correct: 1
    },
    {
        question: "Qual das opções é uma aplicação típica de Aprendizado Não Supervisionado?",
        options: [
            "Prever a temperatura de amanhã em graus Celsius.",
            "Classificar e-mails como 'Spam' ou 'Não Spam'.",
            "Agrupar clientes por comportamento de compra semelhante (Clustering).",
            "Detectar placas de trânsito em imagens com caixas delimitadoras."
        ],
        correct: 2
    },
    {
        question: "Qual o objetivo do algoritmo de 'Gradiente Descendente' (Gradient Descent)?",
        options: [
            "Minimizar a função de perda (custo) ajustando iterativamente os parâmetros do modelo.",
            "Aumentar o tamanho do conjunto de dados sinteticamente.",
            "Converter dados de texto em imagens digitais.",
            "Eliminar vírus e malware em sistemas operacionais."
        ],
        correct: 0
    }
];

let currentQuestionIndex = 0;
let score = 0;
let currentUserName = "";

window.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
});

function switchScreen(screenId) {
    document.querySelectorAll(
        '#screen-home, #screen-quiz, #screen-result'
    ).forEach(el => {
        el.classList.add('is-hidden');
    });

    document.getElementById(screenId).classList.remove('is-hidden');
}

async function renderLeaderboard() {
    const listContainer =
        document.getElementById("home-leaderboard-list");

    const adminListContainer =
        document.getElementById("admin-leaderboard-list");

    const playersCountEl =
        document.getElementById("total-players-count");

    try {
        const { data, error } = await supabase
            .from("quiz_scores")
            .select("id, name, score, total, created_at")
            .order("score", { ascending: false })
            .order("created_at", { ascending: true })
            .limit(100);

        if (error) throw error;

        const leaderboard = data ?? [];

        if (playersCountEl) {
            playersCountEl.textContent =
                `${leaderboard.length} ${
                    leaderboard.length === 1
                        ? "registro"
                        : "registros"
                }`;
        }

        if (leaderboard.length === 0) {
            const emptyHTML = `
                <div class="empty-state">Nenhum registro no placar ainda.</div>
            `;

            if (listContainer) {
                listContainer.innerHTML = emptyHTML;
            }

            if (adminListContainer) {
                adminListContainer.innerHTML = emptyHTML;
            }

            return;
        }

        if (listContainer) {
            listContainer.innerHTML = leaderboard
                .map((item, index) => {
                    const medal = ["🥇", "🥈", "🥉"][index];

                    return `
                        <div class="score-row">
                            <div class="score-player">
                                <span class="score-medal">${medal || `#${index + 1}`}</span>
                                <span class="score-name">${escapeHTML(item.name)}</span>
                            </div>
                            <span class="score-value">${item.score} / ${item.total} pts</span>
                        </div>
                    `;
                })
                .join("");
        }

        if (adminListContainer) {
            adminListContainer.innerHTML = leaderboard
                .map(item => `
                    <div class="admin-score-row">
                        <span class="admin-player-score">
                            ${escapeHTML(item.name)}
                            (${item.score}/${item.total})
                        </span>
                        <div class="admin-row-actions">
                            <span>#${escapeHTML(String(item.id))}</span>
                            <button type="button"
                                data-delete-id="${escapeHTML(String(item.id))}"
                                class="delete-record"
                                title="Excluir registro"
                                aria-label="Excluir pontuação de ${escapeHTML(item.name)}">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6"/></svg>
                            </button>
                        </div>
                    </div>
                `)
                .join("");

            adminListContainer
                .querySelectorAll("[data-delete-id]")
                .forEach(button => {
                    button.addEventListener("click", () => {
                        adminDeleteSingleRecord(button.dataset.deleteId);
                    });
                });
        }
    } catch (error) {
        console.error("Erro ao carregar o ranking:", error);

        if (listContainer) {
            listContainer.textContent =
                "Não foi possível carregar o ranking. Tente novamente.";
        }
    }
}

function startQuiz() {
    const nameInput = document.getElementById('username').value.trim();

    if (!nameInput) {
        alert("Por favor, digite seu nome ou apelido para começar o quiz!");
        return;
    }

    if (questions.length === 0) {
        alert("Nenhuma pergunta cadastrada no quiz!");
        return;
    }

    currentUserName = nameInput;
    currentQuestionIndex = 0;
    score = 0;

    document.getElementById('player-display').textContent = currentUserName;

    switchScreen('screen-quiz');
    loadQuestion();
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    const total = questions.length;

    document.getElementById('question-progress').textContent =
        `Questão ${currentQuestionIndex + 1} de ${total}`;

    document.getElementById('question-text').textContent = q.question;

    const progressPercent = (currentQuestionIndex / total) * 100;

    document.getElementById('progress-bar').style.width =
        `${progressPercent}%`;

    const container = document.getElementById('options-container');
    container.innerHTML = "";

    q.options.forEach((option, index) => {
        const btn = document.createElement('button');

        btn.className = "answer-option";

        btn.innerHTML = `
            <span class="answer-letter">
                ${String.fromCharCode(65 + index)}
            </span>

            <span class="answer-copy">${escapeHTML(option)}</span>
        `;

        btn.onclick = () => selectOption(index);

        container.appendChild(btn);
    });
}

function selectOption(selectedIndex) {
    const q = questions[currentQuestionIndex];

    if (selectedIndex === q.correct) {
        score++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

async function finishQuiz() {
    document.getElementById("progress-bar").style.width = "100%";

    const total = questions.length;

    document.getElementById("final-score").textContent =
        `${score} / ${total}`;

    const percentage = (score / total) * 100;
    const feedbackEl =
        document.getElementById("feedback-message");

    if (percentage === 100) {
        feedbackEl.textContent =
            "Excelente! Você domina Machine Learning! 🎉";
    } else if (percentage >= 70) {
        feedbackEl.textContent =
            "Muito bom! Você tem ótimos conhecimentos na área. 🚀";
    } else if (percentage >= 40) {
        feedbackEl.textContent =
            "Bom esforço! Continue estudando os conceitos. 📚";
    } else {
        feedbackEl.textContent =
            "Não desanime! Revise os conceitos e tente novamente. 💪";
    }

    switchScreen("screen-result");

    feedbackEl.textContent += " Salvando pontuação...";

    try {
        await saveScore(currentUserName, score, total);

        feedbackEl.textContent =
            "Pontuação registrada no ranking global!";

        await renderLeaderboard();
    } catch (error) {
        feedbackEl.textContent =
            "Quiz concluído, mas não foi possível salvar sua pontuação. Tente novamente mais tarde.";
    }
}

async function saveScore(name, finalScore, totalQuestions) {
    const { error } = await supabase
        .from("quiz_scores")
        .insert({
            name: name.trim().slice(0, 60),
            score: finalScore,
            total: totalQuestions
        });

    if (error) {
        console.error("Erro ao salvar a pontuação:", error);
        throw error;
    }
}

function resetHome() {
    document.getElementById('username').value = "";

    renderLeaderboard();
    switchScreen('screen-home');
}

function openAdminModal() {
    document.getElementById('admin-password').value = "";

    document.getElementById('admin-auth-view').classList.remove('is-hidden');
    document.getElementById('admin-panel-view').classList.add('is-hidden');
    document.getElementById('admin-modal').classList.remove('is-hidden');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('is-hidden');
}

function verifyAdminPassword() {
    const pass = document.getElementById('admin-password').value;

    if (pass === "DROGAS") {
        document.getElementById('admin-auth-view').classList.add('is-hidden');
        document.getElementById('admin-panel-view').classList.remove('is-hidden');

        renderLeaderboard();
    } else {
        alert("Senha incorreta! A senha padrão é 1234.");

        document.getElementById('admin-password').value = "";
    }
}

async function adminDeleteSingleRecord(id) {
    if (!confirm("Tem certeza que deseja excluir esta pontuação?")) return;

    const { data, error } = await supabase
        .from("quiz_scores")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) {
        console.error("Erro ao excluir pontuação:", error);
        alert("Não foi possível excluir. Verifique a política DELETE no Supabase.");
        return;
    }

    if (!data?.length) {
        alert("Nenhum registro foi excluído. Verifique as permissões da tabela.");
        return;
    }

    await renderLeaderboard();
}

async function adminClearLeaderboard() {
    if (
        confirm(
            "Tem certeza absoluta que deseja apagar todo o histórico do placar? Esta ação não pode ser desfeita."
        )
    ) {
        const { data, error } = await supabase
            .from("quiz_scores")
            .delete()
            .not("id", "is", null)
            .select("id");

        if (error) {
            console.error("Erro ao limpar o placar:", error);
            alert("Não foi possível limpar o placar. Verifique a política DELETE no Supabase.");
            return;
        }

        await renderLeaderboard();
        alert(`${data?.length ?? 0} registro(s) apagado(s).`);
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag =>
        ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

Object.assign(window, {
    startQuiz,
    openAdminModal,
    closeAdminModal,
    verifyAdminPassword,
    resetHome,
    adminClearLeaderboard
});
