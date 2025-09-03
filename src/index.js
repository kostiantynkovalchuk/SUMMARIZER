import Anthropic from '@anthropic-ai/sdk';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

const htmlContent = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Summarizer</title>
		<meta name="description" content="Summarize your text effortlessly with the Summarizer." />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap" rel="stylesheet" />
		<style>
			:root {
				--font-family: 'Orbitron', sans-serif;
				--text-color: #0f0000;
				--background-color: #83b0bd;
				--input-background-color: #fcd9d3;
				--button-background-color: #f9b759;
				--copied-background-color: #83f5bc;
				--failed-background-color: #ffa3a3;
				--hover-color: #fba122;
				--focus-color: #9f570a;
				--slider-thumb-color: #9f570a;
				--disabled-color: #b38443;
			}

			* {
				box-sizing: border-box;
			}

			html,
			body {
				margin: 0;
				padding: 0;
				height: 100%;
				font-family: var(--font-family);
				color: var(--text-color);
				background: var(--background-color);
			}

			.container {
				display: flex;
				flex-direction: column;
				min-height: 100vh;
				padding: 1rem;
			}

			.header {
				text-align: center;
				padding: 2rem 1rem;
				background: linear-gradient(135deg, var(--button-background-color), var(--hover-color));
				border-radius: 10px;
				margin-bottom: 2rem;
			}

			.header h1 {
				margin: 0;
				font-weight: bold;
			}

			.header-line-1 {
				font-size: 1.5rem;
				display: block;
			}

			.header-line-2 {
				font-size: 3rem;
				display: block;
			}

			.main-content {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 2rem;
				flex-grow: 1;
			}

			.section {
				display: flex;
				flex-direction: column;
				width: 100%;
			}

			textarea {
				width: 100%;
				flex-grow: 1;
				min-height: 200px;
				resize: none;
				border: none;
				border-radius: 6px;
				background-color: var(--input-background-color);
				padding: 1rem;
				margin-bottom: 1rem;
				font-family: sans-serif;
				font-size: 1rem;
			}

			textarea::placeholder {
				color: var(--text-color);
			}

			.controls {
				display: flex;
				flex-direction: column;
				gap: 1rem;
			}

			.summary-length-container {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
			}

			.summary-length-group {
				display: flex;
				align-items: center;
				gap: 0.5rem;
			}

			.summary-length-input {
				flex-grow: 1;
				appearance: none;
				height: 0.8em;
				border-radius: 15px;
				background-color: var(--button-background-color);
			}

			.summary-length-text {
				font-size: 0.9rem;
				font-weight: bold;
			}

			.button {
				font-family: inherit;
				font-weight: bold;
				background-color: var(--button-background-color);
				border: none;
				border-radius: 5px;
				padding: 1rem;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				font-size: 1rem;
			}

			.button:not(:disabled):hover {
				background-color: var(--hover-color);
			}

			.button:disabled {
				background-color: var(--disabled-color);
				cursor: not-allowed;
			}

			.summary-output-section {
				position: relative;
			}

			.summary-content,
			.loading-section,
			.error-section {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}

			.loading-section,
			.error-section {
				display: none;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				background-color: var(--background-color);
			}

			.spinner {
				width: 50px;
				height: 50px;
				border: 3px solid #f3f3f3;
				border-top: 3px solid var(--focus-color);
				border-radius: 50%;
				animation: spin 1s linear infinite;
				margin-bottom: 1rem;
			}

			@keyframes spin {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}

			.error-message {
				margin-bottom: 1rem;
				text-align: center;
				font-weight: bold;
			}

			.copied {
				background-color: var(--copied-background-color) !important;
			}

			.failed {
				background-color: var(--failed-background-color) !important;
			}

			.disabled {
				color: var(--disabled-color);
			}

			/* Slider thumb styles */
			.summary-length-input::-webkit-slider-thumb {
				appearance: none;
				width: 1em;
				height: 1em;
				border-radius: 50%;
				background: var(--slider-thumb-color);
				cursor: pointer;
			}

			.summary-length-input::-moz-range-thumb {
				width: 1em;
				height: 1em;
				border-radius: 50%;
				background: var(--slider-thumb-color);
				cursor: pointer;
				border: none;
			}

			@media (max-width: 768px) {
				.main-content {
					grid-template-columns: 1fr;
				}

				.header-line-1 {
					font-size: 1.5rem;
					letter-spacing: 1px;
				}

				.header-line-2 {
					font-size: 2.5rem;
					letter-spacing: 2px;
				}

				.controls {
					flex-direction: row;
				}
			}
		</style>
	</head>

	<body>
		<div class="container">
			<div class="header">
				<h1>
					<span class="header-line-1">The</span>
					<span class="header-line-2">Summarizer</span>
				</h1>
			</div>

			<div class="main-content">
				<div class="section">
					<textarea id="text-input-area" placeholder="Paste text here" aria-label="Paste text here to summarize"></textarea>
					<div class="controls">
						<div id="summary-length-container" class="summary-length-container disabled">
							<div class="summary-length-group">
								<span>1</span>
								<input type="range" id="summary-length-input" class="summary-length-input" min="1" max="100" value="10" disabled />
								<span>100</span>
							</div>
							<span id="summary-length-text" class="summary-length-text">Summary Length: 10 Words</span>
						</div>
						<button id="summarize-button" class="button" disabled>Summarize</button>
					</div>
				</div>

				<div id="summary-output-section" class="section summary-output-section">
					<div id="summary-content" class="summary-content">
						<textarea id="summary-output-area" placeholder="See summary here" aria-label="Summary of text" disabled></textarea>
						<div class="controls">
							<button id="copy-button" class="button" disabled>Copy</button>
							<button id="clear-button" class="button" disabled>Clear</button>
						</div>
					</div>

					<div id="loading-section" class="loading-section">
						<div class="spinner"></div>
						<div>Summarizing...</div>
					</div>

					<div id="error-section" class="error-section">
						<div id="error-message" class="error-message"></div>
						<button id="dismiss-error-button" class="button">Dismiss Error</button>
					</div>
				</div>
			</div>
		</div>

		<script>
			// Constants
			const workerUrl = 'https://worker.kos-summarize.workers.dev';
			const feedbackDisplayTime = 3000;

			// Element Selectors
			const textInputArea = document.getElementById('text-input-area');
			const summaryLengthContainer = document.getElementById('summary-length-container');
			const summaryLengthInput = document.getElementById('summary-length-input');
			const summaryLengthText = document.getElementById('summary-length-text');
			const summarizeButton = document.getElementById('summarize-button');
			const summaryContent = document.getElementById('summary-content');
			const summaryOutputArea = document.getElementById('summary-output-area');
			const copyButton = document.getElementById('copy-button');
			const clearButton = document.getElementById('clear-button');
			const loadingSection = document.getElementById('loading-section');
			const errorSection = document.getElementById('error-section');
			const errorMessage = document.getElementById('error-message');
			const dismissErrorButton = document.getElementById('dismiss-error-button');

			// Event Listeners
			summarizeButton.addEventListener('click', summarize);
			copyButton.addEventListener('click', copy);
			clearButton.addEventListener('click', clear);
			dismissErrorButton.addEventListener('click', dismissError);
			document.addEventListener('DOMContentLoaded', focusOnTextInputArea);
			textInputArea.addEventListener('input', handleTextInput);
			summaryLengthInput.addEventListener('input', updateSummaryLengthText);

			// Main Functions
			async function summarize() {
				try {
					const summaryLength = summaryLengthInput.value;
					const text = textInputArea.value;
					const messages = [
						{
							role: 'user',
							content: [
								{
									type: 'text',
									text: "Summarize this text. Limit the summary length to " + summaryLength + " words: " + text,
								},
							],
						},
					];

					showLoading();

					const response = await fetch(workerUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(messages),
					});

					hideLoading();

					const result = await response.json();
					if (!response.ok) {
						throw new Error(result.error || 'Failed to summarize');
					}

					console.log('Anthropic response:', JSON.stringify(response));
					console.log('Summary type:', typeof result.summary, result.summary);

					summaryOutputArea.value = result.summary;
					summaryOutputArea.disabled = false;
					copyButton.disabled = false;
					copyButton.focus();
				} catch (error) {
					handleError(error);
				}
			}

			async function copy() {
				try {
					await navigator.clipboard.writeText(summaryOutputArea.value);
					showFeedback('😄 Copied', 'copied');
				} catch (err) {
					showFeedback('😔 Failed', 'failed');
				}
			}

			function clear() {
				textInputArea.value = '';
				summaryOutputArea.value = '';
				textInputArea.disabled = false;
				summaryOutputArea.disabled = true;
				disableControls();
				textInputArea.focus();
			}

			function dismissError() {
				errorSection.style.display = 'none';
				summaryContent.style.display = 'flex';
				clear();
			}

			// Helper Functions
			function focusOnTextInputArea() {
				textInputArea.focus();
			}

			function handleTextInput() {
				if (textInputArea.value.trim()) {
					enableControls();
				} else {
					disableControls();
				}
			}

			function enableControls() {
				summaryLengthContainer.classList.remove('disabled');
				summaryLengthInput.disabled = false;
				summarizeButton.disabled = false;
				clearButton.disabled = false;
			}

			function disableControls() {
				summaryLengthContainer.classList.add('disabled');
				summaryLengthInput.disabled = true;
				summarizeButton.disabled = true;
				summaryOutputArea.disabled = true;
				clearButton.disabled = true;
				copyButton.disabled = true;
			}

			function updateSummaryLengthText() {
				summaryLengthText.textContent = "Summary Length: " + summaryLengthInput.value + " Words";
			}

			function showLoading() {
				summaryContent.style.display = 'none';
				loadingSection.style.display = 'flex';
			}

			function hideLoading() {
				loadingSection.style.display = 'none';
				summaryContent.style.display = 'flex';
			}

			function handleError(error) {
				hideLoading();
				textInputArea.disabled = true;
				disableControls();
				summaryContent.style.display = 'none';
				errorMessage.textContent = "There was an error processing the text: " + error.message;
				errorSection.style.display = 'flex';
			}

			function showFeedback(message, className) {
				copyButton.classList.add(className);
				copyButton.textContent = message;
				setTimeout(() => {
					copyButton.classList.remove(className);
					copyButton.textContent = 'Copy';
				}, feedbackDisplayTime);
			}
		</script>
	</body>
</html>
`;

export default {
	async fetch(request, env, ctx) {
		console.log('Request received:', request.method, request.url);

		if (request.method === 'OPTIONS') {
			return new Response(JSON.stringify({ ok: true }), {
				headers: corsHeaders,
			});
		}

		if (request.method === 'GET') {
			return new Response(htmlContent, {
				headers: {
					'Content-Type': 'text/html',
					...corsHeaders,
				},
			});
		}

		if (request.method === 'POST') {
			try {
				// Check if API key exists
				if (!env.ANTHROPIC_API_KEY) {
					throw new Error('ANTHROPIC_API_KEY not found in environment');
				}

				const anthropic = new Anthropic({
					apiKey: env.ANTHROPIC_API_KEY,
				});

				const messages = await request.json();
				console.log('Received messages:', JSON.stringify(messages));

				const response = await anthropic.messages.create({
					model: 'claude-3-5-sonnet-20240620',
					max_tokens: 300,
					system:
						'You are a text summarizer. When asked to summarize a text, send back the summary of it. Please only send back the summary without prefixing it with things like "Summary" or telling where the text is from. Also give me the summary as if the original author wrote it and without using a third person voice.',
					messages: messages,
				});

				console.log('Anthropic response:', JSON.stringify(response));

				return new Response(JSON.stringify({ summary: response.content[0].text }), {
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
				});
			} catch (error) {
				console.error('Error:', error);
				return new Response(
					JSON.stringify({
						error: error.message || 'An error occurred',
					}),
					{
						status: 500,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json',
						},
					}
				);
			}
		}

		// Handle unsupported methods
		return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
			status: 405,
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json',
			},
		});
	},
};
