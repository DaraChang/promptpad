# promptpad

## How to change a prompt

1. Enter the `index_send.html` file.
2. Find the start of the HTML code (it should start with `<body>`).
3. Locate the buttons with prompts and adjust them. For example:

```html
<button onclick="sendPrompt(this, 1)">
  <em>Before you begin the task</em><br><br>Think aloud the qualities you will look for in Perplexity’s answer.
</button>
