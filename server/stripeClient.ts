import Stripe from 'stripe';

let connectionSettings: any;

async function getCredentials() {
  // First, try to use environment secrets directly (works in both dev and production)
  const envSecretKey = process.env.STRIPE_SECRET_KEY;
  const envPublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (envSecretKey && envPublishableKey) {
    console.log('Using Stripe keys from environment secrets');
    return {
      publishableKey: envPublishableKey,
      secretKey: envSecretKey,
    };
  }

  // Fallback to Replit connector API
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Stripe keys not found in environment and connector API not available');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });

    const data = await response.json();
    
    connectionSettings = data.items?.[0];

    if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
      throw new Error(`Stripe ${targetEnvironment} connection not found via connector`);
    }

    return {
      publishableKey: connectionSettings.settings.publishable,
      secretKey: connectionSettings.settings.secret,
    };
  } catch (error) {
    throw new Error(`Stripe keys not found. Please set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in secrets.`);
  }
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();

  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
      ...(webhookSecret ? { webhookSecret } : {}),
    });
  }
  return stripeSync;
}
