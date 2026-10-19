
import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "SUA_PROJECT_URL";
const SUPABASE_KEY = "SUA_PUBLISHABLE_KEY";

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
        el.classList.add('hidden');
    });

    document.getElementById(screenId).classList.remove('hidden');
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
                <div class="text-center py-6 border
                    border-dashed border-slate-800 rounded-xl">
                    <p class="text-slate-500 text-xs">
                        Nenhum registro no placar ainda.
                    </p>
                </div>
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
                        <div class="flex justify-between items-center
                            p-3 rounded-xl bg-slate-950/80
                            border border-slate-800 text-sm">
                            <div class="flex items-center gap-2
                                truncate max-w-[70%]">
                                <span class="w-5">
                                    ${medal || `#${index + 1}`}
                                </span>
                                <span class="text-slate-200 truncate">
                                    ${escapeHTML(item.name)}
                                </span>
                            </div>
                            <span class="text-indigo-400 text-xs font-bold">
                                ${item.score} / ${item.total} pts
                            </span>
                        </div>
                    `;
                })
                .join("");
        }

        if (adminListContainer) {
            adminListContainer.innerHTML = leaderboard
                .map(item => `
                    <div class="flex justify-between items-center
                        p-2.5 rounded-xl bg-slate-950
                        border border-slate-800 text-xs">
                        <span class="text-slate-200 truncate">
                            ${escapeHTML(item.name)}
                            (${item.score}/${item.total})
                        </span>
                        <span class="text-slate-500">
                            #${item.id}
                        </span>
                    </div>
                `)
                .join("");
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

        btn.className =
            "w-full text-left p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/40 active:bg-slate-800/80 transition duration-200 text-sm font-medium text-slate-200 flex items-start gap-3 group";

        btn.innerHTML = `
            <span class="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center text-xs font-bold transition-colors">
                ${String.fromCharCode(65 + index)}
            </span>

            <span class="pt-0.5 leading-relaxed">${escapeHTML(option)}</span>
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

    document.getElementById('admin-auth-view').classList.remove('hidden');
    document.getElementById('admin-panel-view').classList.add('hidden');
    document.getElementById('admin-modal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

function verifyAdminPassword() {
    const pass = document.getElementById('admin-password').value;

    if (pass === "DROGAS") {
        document.getElementById('admin-auth-view').classList.add('hidden');
        document.getElementById('admin-panel-view').classList.remove('hidden');

        renderLeaderboard();
    } else {
        alert("Senha incorreta! A senha padrão é 1234.");

        document.getElementById('admin-password').value = "";
    }
}

// Excluir um único registro pelo índice
function adminDeleteSingleRecord(index) {
    let leaderboard =
        JSON.parse(localStorage.getItem('ml_quiz_leaderboard')) || [];

    if (index >= 0 && index < leaderboard.length) {
        const deletedName = leaderboard[index].name;

        leaderboard.splice(index, 1);

        localStorage.setItem(
            'ml_quiz_leaderboard',
            JSON.stringify(leaderboard)
        );

        renderLeaderboard();
    }
}

function adminClearLeaderboard() {
    if (
        confirm(
            "Tem certeza absoluta que deseja apagar todo o histórico do placar? Esta ação não pode ser desfeita."
        )
    ) {
        localStorage.removeItem('ml_quiz_leaderboard');

        renderLeaderboard();

        alert("Placar totalmente limpo com sucesso!");
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
