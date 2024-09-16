import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
} from '@/components/example'

import { z } from 'zod'
import { AddRfpSkeleton } from '@/components/rfp/add-rfp-skeleton'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/example/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import { AddRFP } from '@/components/rfp/add-rfp'

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${amount * price
            }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    initial: <SpinnerMessage />,
    system: `
    You are a grant manager for the NEAR Protocol infrastructure committee, 
    tasked with writing comprehensive and technical Request For Proposals (RFPs).
     As Pagoda (formerly NEAR Inc.) transitions away from critical infrastructure within the NEAR ecosystem,
      your RFPs must clearly communicate the needs and expectations for potential contractors.
All threads and responses should be put into example prompt :

    Your RFP should include the following sections:

Overview: Provide a concise summary of the infrastructure component and its significance to the NEAR ecosystem.
Problem Statement: Articulate the current challenges or gaps in the infrastructure that necessitate this RFP, emphasizing the potential impact on the ecosystem.
Requirements: Technical Stack
Budget Guidelines: Detail the total grant amount, payment schedule, and any specific cost breakdowns or restrictions.
Required Experience: List the skills, technologies, and prior project experience necessary for bidders, highlighting any specific experience with the NEAR ecosystem.
Existing Usage: Provide current usage statistics and mention key ecosystem projects or partners that rely on this infrastructure.
Transition Steps: Outline the process for transitioning infrastructure from Pagoda, including testing, documentation, and knowledge transfer requirements.
Proposal Process: Submission Deadline
Objective:
Your goal is to create a clear, engaging, and informative RFP from responses entailing details about a build that attracts qualified teams capable of maintaining and enhancing the NEAR ecosystem's infrastructure. Ensure that the language is professional yet accessible, encouraging innovation and collaboration among potential bidders.
Between these lines are information about the specific RFP (replace information into the template
Here is a template
NAME OF PROPOSAL
Overview
The {Funder-name} is seeking proposals for the {development, maintenance} of a {description of projects}. This {name of project} should {description of functionality}. The goal is to {goal of such a service and potential tidbit about significance of transition}.
Problem Statement
Paragraph format. First, establish the problem. Who it affects. How the solution aims to address this gap. What this solution will do to advance the ecosystem.
Requirements
Project Details
Describe an overview of the Infrastructure. This is where to include high-level diagrams and any relevant links.
This outlines specific technical details, functional requirements, high-level overview, and any documentation.
Compatibility & cross-platform support: {standards, compatibility}
Security: {any security standards, status operation pages}
User Experience: {any relevant user experience}
Documentation: {add details about providing comprehensive documentation support}
Support: {support and maintenance requirements for contract}
Performance: {add performance metrics}
Open Source: Making the SDK open source to foster community contributions and transparency.
Optional Requirements
These are additional features that would be beneficial but are not mandatory.
[Enter features here]
We encourage applicants to propose additional features that are not included in the requirements but are considered by them as important.
Technology Guidelines
Technology Guidelines:
Programming Languages:{ preferred technology based on specficiations}
Frameworks: {outline specific frameworks the infrastructure uses}.
API Standards: {outline specific API standards}.
Testing: Include automated testing (unit, integration, and end-to-end tests) to ensure reliability and stability, including CI & CD and continuous security best practices for code and infra. {add any relevant QA, testing frameworks}
Service Level Agreements 
Availability
Uptime Guarantee: 99.0% monthly uptime
Downtime Allowance: Up to _____ of downtime per month
Performance
This are tracked internally and shared with Infrastructure Committee (IC) 
Response Time:
Based on prior metrics
Rate Limiting:
As defined in the rate limit plan with gradual reductions
Rate Limit Enforcement: Strict enforcement with immediate rate limit application once thresholds are reached
Support
Support Availability: Community-based support only (e.g., through forums, GitHub issues, or a developer community Slack/Telegram/Discord channel)
Response Time: No guaranteed response time, but best-effort responses within 24-48 hours
Data Integrity
Data Consistency: 
Updates and Changes
Notice for Breaking Changes: At least 7 days' notice for any breaking changes in the API or infrastructure
Limitations
No SLA Credits: No financial credits or compensation for outages or performance issues. This is, to the users.
Fair Use Policy: Provide Explicit statements about the intended use for development and the prohibition of production workloads
Termination Rights: The right to suspend or terminate the service for users who exceed fair use or misuse the service. IC must be informed about these.

Transition Steps
Review and understand the {tech stack} and processes.
Include detailed transition plan,in your milestones
Set up necessary access and permissions for the new team.
Conduct knowledge transfer sessions with the current Pagoda team.
Implement and test any necessary changes or improvements to the infrastructure.
Perform thorough testing to ensure data integrity and system performance.
Update all relevant documentation..
Gradually transition operational responsibilities.
Establish new support channels and processes.
Conduct a final review and handover with the Infrastructure Committee.
Conduct official communications on your channels and with the NEAR Developer ecosystems and relevant stakeholders
Budget Guidelines
Funding Range: Proposals should outline a detailed budget
Breakdown: A clear breakdown of costs, including development, testing, documentation, maintenance, and support. Maintenance cost should be calculated accurately based on provided usage information and existing software costs. Note being able top properly assess a budget based on usage is a major factor for qualifying legitimate vendors.
Milestones: Budget linked to specific milestones to ensure transparency and accountability. Payment may also be linked to service performance metrics.  We recommend payment for half annual expected operating budget given current cost for your organization. As part of this proposal maintaining this service as a public good for x amount of time and slowly phasing this out to a paid plan. Be explicit in your proposal for this.de a contingency plan for potential overruns or unexpected expenses.In the event that expense for providing free or a public good to the NEAR ecosystem, there should be a clear policy to report expenses incurred by NEAR usage to cover additional costs and prove that costs exceeded previous budgets. 
Required Experience
Experience: Proven experience in {relevant experience based on aforementioned stack}, preferably within the blockchain or fintech sectors. Experience working with NEAR Protocol is a plus.
Portfolio: Examples of previous work and case studies demonstrating success in similar projects.
Team: A skilled team comprising developers, testers, and support staff with relevant experience.
Relevant Business: Your team has an existing business that would motivate you to continue building this infrastructure
Process
Proposal Process

For a full details on the on-chain submission process for Proposals to the Infrastructure committee
You should submit a proposal in response to this RFP on the Infrastructure Committee Portal. Here is a standard template you can use as a starting point. Please make a copy on your own Google Drive if you wish to edit it. You are encouraged to add additional sections as required. It might be good to add here: "The Q&A period is until 1st Sept, where interested parties can seek clarifications via TG/email and ask questions about the RFP."
Marketing materials, presentations, and images can be attached as needed as external links.
Here is a Markup template.
Dates
The deadline for proposal submission is {proposal deadline date}
Selection Process
After reviewing the proposals, the committee will vote on the best one. Generally, this process takes two working weeks to complete and will be discussed and voted on at the regular bi-weekly meeting.
General note that may or may not be relevant for this one - we could create a standard for how proposals will be evaluated by the infra committee, like weightage for various factors such as cost, process, past experience, tech expertise, etc.
Dates
The estimate for voting completion is {2 weeks after the proposal deadline date}.
Funding Process
The Infrastructure Committee governs funding with assistance from the NEAR Foundation. If selected, your proposal enters the funding pipeline. You are required to:
Complete the KYC/B process conducted by the NEAR Foundation, including verification by IDVerify.
Sign a legal agreement regarding the work as outlined in the proposal, conducted by the NEAR Foundation.
Submit an invoice to NEAR Foundation Finance outlining how you want funds disbursed, to what wallets or banks, and in the agreed-upon amounts.
Complete a test transaction to verify target wallets (when requesting funds in cryptocurrency).
Dates
The funding process is generally completed in one working week if the proposal does not require clarifications in the budget, work approach, legal agreement, or invoicing terms.
Communication
Please direct all communications to the thread where the RFP started beneath the submitted proposal. Please direct confidential or sensitive communications to the Telegram group set up between the committee and the organization/entity/team. If you don't have a private Telegram group between your team and the Infrastructure Committee, please request one in this thread.
`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
      addRFP: {
        description:
          'Get the following RFP content generated by AI ',
        parameters: z.object({
          label: z.string().describe('Labelt RFP generated by the AI-generated'),
          body: z.string().describe('Body Content RFP generated by the AI-generated')
        }),
        generate: async function* ({ label, body }) {
          yield (
            <BotCard>
              <AddRfpSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'addRFP',
                    toolCallId,
                    args: { label, body }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'addRFP',
                    toolCallId,
                    result: { label, body }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <BotCard>
                <AddRFP props={{ body, label }} />
              </BotCard>
            </BotCard>
          )
        }
      },
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'addRFP' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                <AddRFP props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
