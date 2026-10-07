// Small nicety: current year in footer (CSP-safe; no inline script)
document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Update "Last updated" date on roadmap page
  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    lastUpdated.textContent = date.toLocaleDateString('en-US', options);
  }

  // Highlight active navigation link
  try {
    const current = window.location.pathname || '/';
    const normalize = (p) => {
      // Remove duplicate slashes, strip trailing index.html and trailing slashes
      let x = (p || '/').replace(/\/+/g, '/');
      x = x.replace(/index\.html$/i, '');
      if (x.length > 1) x = x.replace(/\/+$/, '/');
      return x;
    };
    const here = normalize(current);
    const links = document.querySelectorAll('header.nav .links a.pill');
    links.forEach((a) => {
      // Use the resolved absolute pathname from the anchor
      const linkPath = normalize(a.pathname || a.getAttribute('href') || '');
      if (linkPath && (here === linkPath || here.endsWith(linkPath))) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  } catch (_) {
    // no-op if URL parsing fails
  }

  // Access Request form -> mailto assembly
  try {
    const form = document.getElementById('accessForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = (fd.get('name') || '').toString().trim();
        const email = (fd.get('email') || '').toString().trim();
        const org = (fd.get('org') || '').toString().trim();
        const interest = (fd.get('interest') || '').toString().trim();
        const use = (fd.get('use') || '').toString().trim();
        const github = (fd.get('github') || '').toString().trim();

        // Minimal client-side validation
        if (!name || !email || !use) {
          alert('Please provide your name, email, and intended use.');
          return;
        }

        const subject = encodeURIComponent('SmarterGPT Controlled Access Request');
        const bodyLines = [
          `Name: ${name}`,
          `Email: ${email}`,
          org ? `Organization: ${org}` : '',
          interest ? `Interest: ${interest}` : '',
          github ? `GitHub: ${github}` : '',
          '',
          'Intended Use / Goals:',
          use,
          '',
          `Page: ${location.href}`
        ].filter(Boolean);
        const body = encodeURIComponent(bodyLines.join('\n'));

        const mailto = `mailto:hello@smartergpt.dev?subject=${subject}&body=${body}`;
        // Open mail client; also update fallback link for copy/open
        const fallback = document.getElementById('fallbackMailto');
        if (fallback) fallback.href = mailto;
        window.location.href = mailto;

        const success = document.getElementById('successMsg');
        if (success) success.style.display = 'block';
      });
    }
  } catch (_) {
    // ignore
  }

  // Hydrate package version badges from the npm registry.
  // Static fallback text remains visible if the registry is unavailable.
  try {
    const nodes = Array.from(document.querySelectorAll('[data-npm-package]'));
    const packages = [...new Set(nodes.map((node) => node.getAttribute('data-npm-package')).filter(Boolean))];
    const cache = new Map();

    packages.forEach(async (pkg) => {
      try {
        const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`, {
          headers: { Accept: 'application/json' }
        });

        if (response.status === 404) {
          cache.set(pkg, { state: 'missing', label: 'not published on npm' });
        } else if (!response.ok) {
          throw new Error(`npm registry returned ${response.status}`);
        } else {
          const data = await response.json();
          const latest = data?.['dist-tags']?.latest || data?.version;
          cache.set(pkg, {
            state: 'loaded',
            label: latest ? `npm ${latest}` : 'npm package'
          });
        }
      } catch (_) {
        cache.set(pkg, { state: 'error', label: 'npm status unavailable' });
      }

      nodes
        .filter((node) => node.getAttribute('data-npm-package') === pkg)
        .forEach((node) => {
          const result = cache.get(pkg);
          if (!result) return;
          node.textContent = result.label;
          node.setAttribute('data-state', result.state);
          node.setAttribute('title', `${pkg}: ${result.label}`);
        });
    });
  } catch (_) {
    // no-op if fetch or DOM APIs are unavailable
  }

  // Fetch public release tags while keeping the /releases/latest link usable.
  // The fallback stays visible when GitHub is unavailable or rate-limits a request.
  try {
    const nodes = Array.from(document.querySelectorAll('[data-github-repo]'));
    const repos = [...new Set(nodes.map((node) => node.getAttribute('data-github-repo')).filter(Boolean))];

    repos.forEach(async (repo) => {
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return;
      const matchingNodes = nodes.filter((node) => node.getAttribute('data-github-repo') === repo);
      if (typeof AbortController !== 'function') return;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        const release = await response.json();
        if (release.draft || release.prerelease || typeof release.tag_name !== 'string' || !release.tag_name.trim()) {
          throw new Error('No published release tag');
        }

        matchingNodes.forEach((node) => {
          node.textContent = release.tag_name.trim();
          node.setAttribute('data-state', 'loaded');
          node.setAttribute('title', `${repo}: latest published release`);
        });
      } catch (_) {
        matchingNodes.forEach((node) => {
          node.setAttribute('data-state', 'error');
          node.setAttribute('title', 'Version lookup unavailable; open GitHub for the latest release');
        });
      } finally {
        clearTimeout(timeout);
      }
    });
  } catch (_) {
    // Keep the static release link when browser APIs are unavailable.
  }
});
