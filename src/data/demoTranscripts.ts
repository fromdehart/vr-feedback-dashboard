export const DEMO_SCENARIO =
  "Customer service de-escalation: a customer calls in furious about a damaged product they received as a birthday gift, threatening to post a negative review publicly.";

export const DEMO_GOAL =
  "Acknowledge the customer's frustration, take ownership of the issue, and offer a satisfying resolution while preserving the relationship.";

export const DEMO_TRANSCRIPTS: Record<
  "poor" | "average" | "strong",
  { label: string; transcript: string }
> = {
  poor: {
    label: "Poor performance",
    transcript: `Agent: Hi, what do you want?
Customer: I ordered a birthday gift for my daughter and it arrived completely smashed! This is absolutely unacceptable.
Agent: Okay, what's your order number?
Customer: I don't have it in front of me. Can you look it up by my name?
Agent: I need the order number. It's policy.
Customer: This is ridiculous. I'm a loyal customer and you're treating me like this?
Agent: Look, I just need the order number to help you.
Customer: Fine. Whatever. You know what, I'm going to post about this on every review site I can find.
Agent: That's your choice. I can't do anything without the order number.
Customer: You're not even sorry? You don't care that my daughter's birthday was ruined?
Agent: We ship thousands of packages. Damage happens sometimes. If you give me the order number I'll check.
Customer: Forget it. I'm never shopping here again.
Agent: Okay. Have a good day.`,
  },
  average: {
    label: "Average performance",
    transcript: `Agent: Thank you for calling support. How can I help you today?
Customer: I ordered a birthday gift for my daughter and it arrived completely smashed. I'm so upset right now.
Agent: I'm sorry to hear that. That sounds really frustrating. Can I get your order number?
Customer: I don't have it with me but can you look me up by name? It's Sarah Chen.
Agent: Sure, let me search for that. Found it. I can see the order. I'm sorry about the damaged item.
Customer: This was a birthday present and her party is tomorrow.
Agent: I understand this is time-sensitive. I can send a replacement but standard shipping would take 3 to 5 days.
Customer: That's too late! Her birthday is tomorrow!
Agent: I see your concern. I can offer you a refund if you'd like.
Customer: A refund doesn't fix tomorrow's birthday. I'm going to leave a review about this.
Agent: I understand your frustration. A refund is what I'm able to offer given the shipping timeframe. I'm really sorry.
Customer: Fine. Process the refund I guess.
Agent: Done. Is there anything else I can help with?
Customer: No. I'm disappointed.
Agent: I'm sorry again. Have a good day.`,
  },
  strong: {
    label: "Strong performance",
    transcript: `Agent: Thank you for calling, you've reached customer support. My name is Jordan. How can I help you today?
Customer: I ordered a birthday gift for my daughter and it arrived completely smashed. Her party is tomorrow and I am absolutely furious right now.
Agent: Oh no — I am so sorry. That is genuinely awful, especially with the party tomorrow. A damaged gift right before your daughter's birthday is exactly the kind of thing that should never happen, and I completely understand why you're upset. I want to make this right for you and for her.
Customer: Thank you for saying that. I've been on hold for twenty minutes and I was dreading this call.
Agent: That wait was too long and I appreciate your patience. You have every right to be frustrated on multiple levels here. Can I pull up your order? If you have your order number that's quickest, but I can also search by your name or email if that's easier.
Customer: My name is Sarah Chen.
Agent: Perfect, found you. I can see the order and the item. Sarah, here's what I can do: I'm going to flag this as a priority replacement and personally escalate it to our fulfillment team for overnight shipping at no charge to you. You should have it by 10am tomorrow morning. I'll also issue a full refund for the damaged item so you're not paying twice.
Customer: Wait — you can actually get it here by tomorrow morning?
Agent: That's what I'm pushing for. I want to be transparent: it depends on our warehouse stock and courier cutoff, so I'm going to stay on this call with you, place the escalation right now, and confirm the delivery window before we hang up. Would that work for you?
Customer: Yes, absolutely. I really appreciate you actually trying to help.
Agent: Of course. While I'm placing the escalation — I want to ask, was there any other part of the experience that was disappointing, like the packaging or the communication leading up to delivery? I want to flag everything.
Customer: Honestly the box looked like it had been dropped from a height. The outer packaging was barely taped.
Agent: That's really helpful to know and I'm noting it in your account so our quality team reviews that shipment route. Okay — escalation is in. Overnight delivery confirmed for tomorrow before noon, and your refund will appear in 3 to 5 business days. You'll get an email confirmation in the next 10 minutes. Is there anything else I can do for you today, Sarah?
Customer: No, this is more than I expected honestly. Thank you Jordan.
Agent: I'm glad we could turn this around. I hope your daughter has a wonderful birthday tomorrow.`,
  },
};
