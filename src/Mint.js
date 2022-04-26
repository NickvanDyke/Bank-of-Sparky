import styled from "@emotion/styled";
import { ethers } from "ethers";
import { useContext, useState } from "react";
import { BankOfSparky } from "./App";
import { MaterialButton } from "./Styled";

export const Mint = () => {
  const bankOfSparky = useContext(BankOfSparky)
  const [recipient, setRecipient] = useState("")
  const [amt, setAmt] = useState("")

  async function mint() {
    const mintTx = await bankOfSparky.mint(recipient, amt)
    await mintTx.wait()
    setRecipient("")
    setAmt("")
  }

  const isAddressValid = ethers.utils.isAddress(recipient)

  return (
    <MintContainer>
      {/* TODO green/red border depending on whether address is valid*/}
      <RecipientInput
        placeholder="Recipient address"
        value={recipient}
        onChange={event => setRecipient(event.target.value)} />
      <AmtInput
        placeholder="Amount"
        value={amt}
        onChange={event => setAmt(event.target.value.replace(/[^\d]+/g,''))} />
      <MaterialButton
        disabled={recipient === "" || amt === "" || !isAddressValid}
        onClick={() => mint()}>
        Mint
      </MaterialButton>
    </MintContainer>
  )
}

const MintContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  gap: 1em;
  padding: 1em;
  background: darkseagreen;
`

const AmtInput = styled.input`
  border-radius: 5px;
  padding: .5em;
  outline: none;
  border-color: transparent;
`

const RecipientInput = styled(AmtInput)`
  border-color: ${props => {
      if (props.value === "") {
        return "transparent"
      } else if (ethers.utils.isAddress(props.value)) {
        return "green"
      } else {
        return "red"
      }
    }
  };
`
