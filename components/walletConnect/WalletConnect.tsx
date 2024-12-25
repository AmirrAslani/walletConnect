import { useState, useEffect } from 'react';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

const WalletConnect = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletConnectProvider, setWalletConnectProvider] = useState<WalletConnectProvider | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

// ذخیره اطلاعات در local storage بعد از اتصال
  useEffect(() => {
    const storedAccount = localStorage.getItem('account');
    const storedBalance = localStorage.getItem('balance');
    if (storedAccount && storedBalance) {
      setAccount(storedAccount);
      setBalance(storedBalance);
    }
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);

      // تنظیم WalletConnectProvider
      const provider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/ecaa34d29d5e45839bb6ed01b273de25", // استفاده از api key شخصی در شبکه اتریوم
        },
        qrcode: true,
      });

      // فعال‌سازی WalletConnect
      await provider.enable();
      setWalletConnectProvider(provider);

      // ایجاد BrowserProvider برای ارتباط با Ethers.js
      const web3Provider = new ethers.BrowserProvider(provider as any);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      // دریافت موجودی حساب
      const ethBalance = await web3Provider.getBalance(address);
      const formattedBalance = ethers.formatEther(ethBalance); // استفاده از formatEther برای تبدیل موجودی
      setBalance(formattedBalance);

      // ذخیره اطلاعات در localStorage
      localStorage.setItem('account', address);
      localStorage.setItem('balance', formattedBalance);

      setLoading(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

// قطع اتصال کیف پول
  const disconnectWallet = async () => {
    if (walletConnectProvider) {
      await walletConnectProvider.disconnect();
      setWalletConnectProvider(null);
      setAccount(null);
      setBalance(null);

      localStorage.removeItem('account');
      localStorage.removeItem('balance');
    }
  };

  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl font-bold mb-4">WalletConnect</h1>
      {loading ? (
        <p>Connecting...</p>
      ) : !account ? (
        <button
          onClick={connectWallet}
          className="px-5 py-2.5 text-lg bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4 text-lg font-medium">Connected Account: {account}</p>
          <p className="mb-4 text-lg font-medium">Balance: {balance} ETH</p>
          <button
            onClick={disconnectWallet}
            className="px-5 py-2.5 text-lg bg-red-500 text-white rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
