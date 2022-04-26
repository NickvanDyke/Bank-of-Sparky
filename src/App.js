import styled from '@emotion/styled';
import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import { Accounts } from './Accounts';
import BankOfSparkyContract from './artifacts/web3/contracts/BankOfSparky.sol/BankOfSparky.json';
import { BankHeader } from './BankHeader';
import { Card } from './Card';
import { MyAccount } from './MyAccount';
import { Transactions } from './Transactions';

const provider = new ethers.providers.Web3Provider(window.ethereum);
// TODO function that returns appropriate address based on chainId
const bankOfSparkyAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"

export const BankOfSparky = createContext(null);
export const Provider = createContext(provider)

export const App = () => {
	const [bankOfSparky, setBankOfSparky] = useState(null)

	useEffect(() => {
		window.ethereum.on('chainChanged', () => {
			window.location.reload()
		})
		window.ethereum.on('accountsChanged', () => {
			window.location.reload()
		})
	}, [])

	useEffect(() => {
		provider.send("eth_requestAccounts", [])
			.then(() => {
				setBankOfSparky(new ethers.Contract(bankOfSparkyAddress, BankOfSparkyContract.abi, provider.getSigner()))
			})
	}, [setBankOfSparky])


	if (!bankOfSparky) {
		return null
	}

	return (
		<BankOfSparky.Provider value={bankOfSparky}>
			<BigBoyContainer>
				<TopRow>
					<BankHeader />
					<MyAccount />
				</TopRow>
				<BottomRow>
					<Accounts />
					<Transactions />
				</BottomRow>
			</BigBoyContainer>
		</BankOfSparky.Provider>
	)
}

const BigBoyContainer = styled.div`
	background-image: url("/sparky-stare.jpeg");
	background-position: center;
	background-size: cover;
	display: flex;
	flex-direction: column;
	row-gap: 32px;
	padding: 100px;
`

const TopRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	column-gap: 64px;
	row-gap: 32px;
	justify-content: space-between;
`

const BottomRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	flex-wrap: wrap;
	gap: 32px;
`

export const BottomContainer = styled(Card)`
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: stretch;
	min-height: 125px;
	max-height: 400px;
`

export const BottomList = styled.div`
	overflow: auto;
	padding-top: 0px;
	padding-left: 16px;
	padding-right: 16px;
	padding-bottom: 16px;
`

export const BottomTitle = styled.div`
	margin: 16px;
	text-align: center;
	font-size: 1.5em;
	font-weight: bold;
`

export const BottomEmptyText = styled.div`
	margin: auto;
	text-align: center;
	font-style: italic;
`

export function ellipsizeAddress(addr) {
	const stringAddr = String(addr)
	return stringAddr.substring(0, 12) + "..." + stringAddr.substring(stringAddr.length - 10)
}