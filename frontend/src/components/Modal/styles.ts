import styled from "styled-components";
import { SCREEN_BREAKPOINTS } from "../../constants/breakpoints";

interface LabelContainerProps {
  $color: any;
}

interface ErrorProps {
  $containsError?: boolean
}

export const Container = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99999;
  backdrop-filter: blur(2px);
  isolation: isolate;
`

export const ModalContent = styled.div`
  padding: 2.5rem;
  min-height: 450px;
  width: 650px;
  background-color: ${({theme}) => theme.colors.components_background};
  border-radius: 16px;
  position: relative;
  z-index: 100000;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 8px 25px rgba(0,0,0,0.2);
  border: 1px solid ${({theme}) => theme.colors.border};
  isolation: isolate;

  img {
    height: 18px;
    width: 18px;
    position: absolute;
    right: 1.5rem;
    top: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  @media(max-width: ${SCREEN_BREAKPOINTS.SMALL}px) {
    padding: 2rem;
    width: 90vw;
    margin: 1rem;

    img{
      right: 1rem;
      top: 1rem;
    }
  }
`

export const Input = styled.input<ErrorProps>`
  width: 100%;
  height: 3rem;
  margin: 0.5rem 0 ${({ $containsError }) => $containsError ? 0 : '2rem'} 0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 2px solid ${({theme}) => theme.colors.border};
  background-color: ${({theme}) => theme.colors.components_background};
  color: ${({theme}) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({theme}) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({theme}) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({theme}) => theme.colors.placeholder};
  }
`

export const MultilineInput = styled.textarea<ErrorProps>`
  width: 100%;
  height: 5rem;
  margin: 0.5rem 0 ${({ $containsError }) => $containsError ? 0 : '2rem'} 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid ${({theme}) => theme.colors.border};
  background-color: ${({theme}) => theme.colors.components_background};
  color: ${({theme}) => theme.colors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({theme}) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({theme}) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({theme}) => theme.colors.placeholder};
  }
`

export const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;

  @media(max-width: ${SCREEN_BREAKPOINTS.SMALL}px) {
    gap: 10px;
  }
`

export const Button = styled.button`
  margin-top: 2rem;
  background: linear-gradient(135deg, ${({theme}) => theme.colors.primary}, ${({theme}) => theme.colors.primary_hover});
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 0;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(235, 98, 47, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(235, 98, 47, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

export const LabelContainer = styled.div<LabelContainerProps>`
  padding: 0.75rem 1rem;
  background-color: ${({$color}) => $color};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  label{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  i{
    font-style: normal;
    font-weight: 600;
    color: #fff;
    padding-left: 0.5rem;
    text-transform: uppercase;
    cursor: pointer;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }
`

export const ErrorMessage = styled.p`
  color: ${({theme}) => theme.colors.bug};
  padding: 0.5rem 0 1.5rem 0;
`