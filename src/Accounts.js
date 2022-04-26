import { useContext, useEffect, useState } from "react";
import { Account } from "./Account";
import { BankOfSparky, BottomContainer, BottomEmptyText, BottomList, BottomTitle } from "./App";

export const Accounts = () => {
	const bankOfSparky = useContext(BankOfSparky)
	const [accounts, setAccounts] = useState(new Set())

	useEffect(() => {
		bankOfSparky.allAccounts()
			.then(accounts => setAccounts(accounts))
	}, [bankOfSparky, setAccounts])

	useEffect(() => {
		bankOfSparky.on(bankOfSparky.filters.Deposit(), (account) => {
			setAccounts(prev => new Set(prev).add(account))
		})
		bankOfSparky.on(bankOfSparky.filters.Withdrawal(), (account) => {
			setAccounts(prev => new Set(prev).add(account))
		})

		return () => { bankOfSparky.removeAllListeners() }
	}, [bankOfSparky, setAccounts])

	return (
		<BottomContainer>
			<BottomTitle>Accounts</BottomTitle>
			<BottomList>
				{accounts.length === 0
					? <BottomEmptyText>No accounts</BottomEmptyText>
					: [...accounts].map(account => <Account key={account} account={account} />)}
			</BottomList>
		</BottomContainer>
	)
}