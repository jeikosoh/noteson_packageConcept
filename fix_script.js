const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const badText = `<script>
    </div>
  </div>

  <script>`;
html = html.replace(badText, '<script>');
fs.writeFileSync('index.html', html);
console.log("Fixed!");
