async function test() {
  const healthRes = await fetch('http://localhost:3000/api/health');
  console.log('Health:', await healthRes.json());

  const chatRes = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'book redbus mumbai to pune for tomorrow' })
  });
  console.log('Chat response:', await chatRes.json());

  const htmlRes = await fetch('http://localhost:3000/');
  const html = await htmlRes.text();
  console.log('HTML length:', html.length, 'Contains Antigravity:', html.includes('Antigravity Browser Automation Suite'));
}

test().catch(console.error);
