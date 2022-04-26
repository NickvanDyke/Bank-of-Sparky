import styled from "@emotion/styled"
import { Tooltip } from "@mui/material"
import { BigNumber, ethers } from "ethers"
import { useContext, useEffect, useState } from "react"
import { BankOfSparky, BottomContainer, BottomEmptyText, BottomList, BottomTitle, ellipsizeAddress, Provider } from "./App"
import { BottomContainerRow } from "./BottomContainerRow"

export const Transactions = () => {
	const provider = useContext(Provider)
	const bankOfSparky = useContext(BankOfSparky)

	const [deposits, setDeposits] = useState([])
	const [withdrawals, setWithdrawals] = useState([])

	useEffect(() => {
		provider.getBlockNumber()
			.then(currentBlockNumber => {
				const depositFilter = bankOfSparky.filters.Deposit()
				const withdrawalFilter = bankOfSparky.filters.Withdrawal()
				depositFilter.fromBlock = currentBlockNumber - 10
				withdrawalFilter.fromBlock = currentBlockNumber - 10

				bankOfSparky.on(depositFilter, (account, amt, desc, timestamp) => {
					setDeposits(prev => prev.concat([{ account: account, amt: amt, desc: desc, timestamp: timestamp }]))
				})
				bankOfSparky.on(withdrawalFilter, (account, amt, desc, timestamp) => {
					setWithdrawals(prev => prev.concat([{ account: account, amt: amt, desc: desc, timestamp: timestamp }]))
				})
			})

		return () => { bankOfSparky.removeAllListeners() }
	}, [provider, bankOfSparky, setDeposits, setWithdrawals])

	return (
		<BottomContainer>
			<BottomTitle>Recent transactions</BottomTitle>
			<BottomList>
				{deposits.length === 0 && withdrawals.length === 0
					? <BottomEmptyText>No recent transactions</BottomEmptyText>
					: deposits.map(tx => { return { ...tx, isDeposit: true } })
						.concat(withdrawals.map(tx => { return { ...tx, isDeposit: false } }))
						.sort((a, b) => b.timestamp.cmp(a.timestamp))
						.map(tx => Transaction(tx))}
			</BottomList>
		</BottomContainer>
	)
}

const Transaction = ({ account, amt, desc, timestamp, isDeposit }) => {
	return (
		<TxContainer isDeposit={isDeposit}>
			<Desc>{desc}</Desc>
			<AddrAndAmt>
				<Tooltip title={String(account)}>
					<Address>{ellipsizeAddress(account)}</Address>
				</Tooltip>
				<Amt>{(isDeposit ? "+" : "-") + ethers.utils.formatEther(amt) + " ETH"}</Amt>
				{/* <Timestamp>{new Date(timestamp)}</Timestamp> */}
			</AddrAndAmt>
		</TxContainer>
	)
}

const TxContainer = styled(BottomContainerRow)`
	display: flex;
	flex-direction: column;
	gap: 8px;
	border-color: ${props => props.isDeposit ? 'green' : 'red'}
`

const AddrAndAmt = styled.div`
	display: flex;
	flex-wrap: wrap-reverse;
	column-gap: 16px;
	flex-direction: row;
	justify-content: space-between;
`

const Address = styled.div`
`

const Amt = styled.div`
	font-weight: bold;
`

const Desc = styled.div`
	font-style: italic;
`

const Timestamp = styled.div``

BigNumber.prototype.cmp = function (other) {
	if (this.eq(other)) {
		return 0;
	} else if (this.lt(other)) {
		return -1;
	} else {
		return 1;
	}
};